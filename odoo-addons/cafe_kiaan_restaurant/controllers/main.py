import base64
import json
import secrets

from werkzeug.security import check_password_hash, generate_password_hash

from odoo import SUPERUSER_ID, http
from odoo.http import Response, request


def _normalize_phone(phone):
    value = "".join(ch for ch in str(phone or "") if ch.isdigit() or ch == "+")
    value = value.replace("+", "")
    if value.startswith("880"):
        return value
    if value.startswith("01"):
        return "88" + value
    return value


def _normalize_email(email):
    return (email or "").strip().lower()


class CafeKiaanApi(http.Controller):
    _cors = "http://localhost:3000"

    def _cors_headers(self):
        origin = request.httprequest.headers.get("Origin", "")
        allowed = {"http://localhost:3000", "http://127.0.0.1:3000"}
        return [
            ("Access-Control-Allow-Origin", origin if origin in allowed else self._cors),
            ("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
            ("Vary", "Origin"),
        ]

    def _json(self, payload, status=200):
        return Response(
            json.dumps(payload, default=str),
            status=status,
            content_type="application/json; charset=utf-8",
            headers=self._cors_headers(),
        )

    def _options_response(self):
        return Response(
            status=204,
            headers=self._cors_headers() + [("Access-Control-Max-Age", "86400")],
        )

    @http.route([
        "/cafe-kiaan/api/menu",
        "/cafe-kiaan/api/menu/categories",
        "/cafe-kiaan/api/menu/category/<string:category>",
        "/cafe-kiaan/api/orders",
        "/cafe-kiaan/api/orders/quote",
        "/cafe-kiaan/api/orders/<int:order_id>",
        "/cafe-kiaan/api/orders/<int:order_id>/status",
        "/cafe-kiaan/api/customer/orders",
        "/cafe-kiaan/api/account/register",
        "/cafe-kiaan/api/account/login",
        "/cafe-kiaan/api/account/me",
        "/cafe-kiaan/api/account/logout",
        "/cafe-kiaan/api/health",
    ], type="http", auth="public", methods=["OPTIONS"], csrf=False, cors=_cors)
    def options(self, **kwargs):
        return self._options_response()

    @http.route("/cafe-kiaan/api/menu", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def menu(self, **kwargs):
        domain = [
            ("cafe_is_menu_item", "=", True),
            ("cafe_available", "=", True),
            ("active", "=", True),
            ("sale_ok", "=", True),
            "|", ("cafe_menu_category_id", "=", False), ("cafe_menu_category_id.active", "=", True),
        ]
        if kwargs.get("category") and kwargs["category"].lower() != "all":
            domain += ["|", ("cafe_menu_category_id.name", "=ilike", kwargs["category"]), ("cafe_category", "=ilike", kwargs["category"])]
        search = kwargs.get("search")
        if search:
            domain += ["|", "|", "|", ("name", "ilike", search), ("cafe_description", "ilike", search), ("cafe_category", "ilike", search), ("cafe_menu_category_id.name", "ilike", search)]
        items = request.env["product.template"].sudo().search(domain, order="cafe_featured desc, name")
        return self._json([self._item_data(item) for item in items])

    @http.route("/cafe-kiaan/api/menu/categories", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def categories(self, **kwargs):
        category_model = request.env["cafe.menu.category"].sudo()
        categories = category_model.search([("active", "=", True)], order="sequence, id")
        return self._json([category.name for category in categories if category.name])

    @http.route("/cafe-kiaan/api/menu/category/<string:category>", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def category(self, category, **kwargs):
        items = request.env["product.template"].sudo().search([
            ("cafe_is_menu_item", "=", True), ("cafe_available", "=", True),
            ("active", "=", True), ("sale_ok", "=", True),
            "|", ("cafe_menu_category_id", "=", False), ("cafe_menu_category_id.active", "=", True),
        ], order="name")
        wanted = category.strip().casefold()
        items = items.filtered(lambda item: self._product_category(item).casefold() == wanted)
        return self._json([self._item_data(item) for item in items])

    def _find_or_create_partner(self, customer, customer_token=None):
        partner_model = request.env["res.partner"].with_user(SUPERUSER_ID)
        name = (customer.get("name") or "").strip()
        phone = (customer.get("phone") or "").strip()
        email = (customer.get("email") or "").strip()
        phone_key = _normalize_phone(phone)
        email_key = _normalize_email(email)

        partner = False
        if customer_token:
            token_partner = partner_model.search([("cafe_web_customer_token", "=", customer_token)], limit=1)
            if token_partner:
                token_phone = _normalize_phone(token_partner.phone)
                token_email = _normalize_email(token_partner.email)
                # A saved token may only be reused when the newly submitted
                # checkout identity still matches it. This prevents Customer B
                # from accidentally creating an order under Customer A.
                if phone_key and token_phone == phone_key:
                    partner = token_partner
                elif email_key and token_email == email_key:
                    partner = token_partner

        if not partner and phone_key:
            candidates = partner_model.search([("phone", "!=", False)], order="id")
            partner = next((p for p in candidates if _normalize_phone(p.phone) == phone_key), False)

        if not partner and email_key:
            partner = partner_model.search([("email", "=ilike", email)], limit=1)

        vals = {
            "name": name,
            "phone": phone,
            "email": email or False,
            "street": (customer.get("address") or "").strip() or False,
            "customer_rank": 1,
        }
        if partner:
            partner.write({k: v for k, v in vals.items() if v not in (False, "")})
        else:
            partner = partner_model.create(vals)

        if not partner.cafe_web_customer_token:
            partner.cafe_web_customer_token = secrets.token_urlsafe(32)
        return partner

    @staticmethod
    def _customer_data(partner):
        return {
            "name": partner.name or "",
            "phone": partner.phone or "",
            "email": partner.email or "",
            "address": partner.street or "",
        }

    def _account_payload(self, partner):
        if not partner.cafe_web_customer_token:
            partner.cafe_web_customer_token = secrets.token_urlsafe(32)
        return {
            "customer_token": partner.cafe_web_customer_token,
            "customer": self._customer_data(partner),
        }

    @http.route("/cafe-kiaan/api/account/register", type="http", auth="public", methods=["POST"], csrf=False, cors=_cors)
    def account_register(self, **kwargs):
        try:
            payload = json.loads(request.httprequest.data or "{}")
            customer = payload.get("customer") or {}
            name = (customer.get("name") or "").strip()
            phone = (customer.get("phone") or "").strip()
            email = _normalize_email(customer.get("email"))
            password = str(payload.get("password") or "")
            address = (customer.get("address") or "").strip()
            if not name or not phone or not email or not address or len(password) < 6:
                return self._json({"detail": "Name, phone, email, address and a password of at least 6 characters are required."}, 400)

            partner_model = request.env["res.partner"].sudo()
            phone_key = _normalize_phone(phone)
            candidates = partner_model.search([("phone", "!=", False)], order="id")
            partner_by_phone = next((p for p in candidates if _normalize_phone(p.phone) == phone_key), False) if phone_key else False
            partner_by_email = partner_model.search([("email", "=ilike", email)], limit=1)
            partner = partner_by_email or partner_by_phone

            if partner and partner.cafe_web_password_hash:
                return self._json({"detail": "An account already exists with these customer details. Please sign in."}, 409)

            vals = {
                "name": name,
                "phone": phone,
                "email": email,
                "street": address,
                "customer_rank": 1,
                "cafe_web_password_hash": generate_password_hash(password),
            }
            if partner:
                partner.write(vals)
            else:
                partner = partner_model.create(vals)
            if not partner.cafe_web_customer_token:
                partner.cafe_web_customer_token = secrets.token_urlsafe(32)
            return self._json(self._account_payload(partner), 201)
        except (TypeError, ValueError) as error:
            return self._json({"detail": str(error)}, 400)
        except Exception as error:
            return self._json({"detail": str(error)}, 500)

    @http.route("/cafe-kiaan/api/account/login", type="http", auth="public", methods=["POST"], csrf=False, cors=_cors)
    def account_login(self, **kwargs):
        try:
            payload = json.loads(request.httprequest.data or "{}")
            email = _normalize_email(payload.get("email"))
            password = str(payload.get("password") or "")
            if not email or not password:
                return self._json({"detail": "Email and password are required."}, 400)
            partner = request.env["res.partner"].sudo().search([("email", "=ilike", email)], limit=1)
            if not partner or not partner.cafe_web_password_hash or not check_password_hash(partner.cafe_web_password_hash, password):
                return self._json({"detail": "Invalid email or password."}, 401)
            if not partner.cafe_web_customer_token:
                partner.cafe_web_customer_token = secrets.token_urlsafe(32)
            return self._json(self._account_payload(partner))
        except (TypeError, ValueError) as error:
            return self._json({"detail": str(error)}, 400)
        except Exception as error:
            return self._json({"detail": str(error)}, 500)

    @http.route("/cafe-kiaan/api/account/me", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def account_me(self, **kwargs):
        token = (kwargs.get("token") or "").strip()
        if not token:
            return self._json({"detail": "Customer token is required."}, 401)
        partner = request.env["res.partner"].sudo().search([("cafe_web_customer_token", "=", token)], limit=1)
        if not partner or not partner.cafe_web_password_hash:
            return self._json({"detail": "Customer session not found."}, 401)
        return self._json(self._account_payload(partner))

    @http.route("/cafe-kiaan/api/account/logout", type="http", auth="public", methods=["POST"], csrf=False, cors=_cors)
    def account_logout(self, **kwargs):
        token = (kwargs.get("token") or "").strip()
        if not token:
            try:
                token = (json.loads(request.httprequest.data or "{}").get("token") or "").strip()
            except (TypeError, ValueError):
                token = ""
        if token:
            partner = request.env["res.partner"].sudo().search([("cafe_web_customer_token", "=", token)], limit=1)
            if partner:
                # Revoke only this persistent web credential. Historical orders stay linked.
                partner.cafe_web_customer_token = False
        return self._json({"ok": True})

    @http.route("/cafe-kiaan/api/orders", type="http", auth="public", methods=["POST"], csrf=False, cors=_cors)
    def create_order(self, **kwargs):
        try:
            payload = json.loads(request.httprequest.data or "{}")
            items = payload.get("items") or []
            order_type = payload.get("order_type")
            if not items or order_type not in ("delivery", "pickup"):
                return self._json({"detail": "Invalid order payload"}, 400)

            customer = payload.get("customer") or {}
            name = (customer.get("name") or "").strip()
            phone = (customer.get("phone") or "").strip()
            if not name or not phone:
                return self._json({"detail": "Customer name and phone are required"}, 400)
            if order_type == "delivery" and not (customer.get("address") or "").strip():
                return self._json({"detail": "Delivery address is required"}, 400)

            order_lines, delivery_fee, error = self._prepare_order_lines(items, order_type)
            if error:
                return self._json({"detail": error}, 400 if error.startswith("Invalid") else 500)

            payment_method = payload.get("payment_method") or ("cash_on_delivery" if order_type == "delivery" else "cash_on_pickup")
            if payment_method not in ("cash_on_delivery", "cash_on_pickup"):
                return self._json({"detail": "Invalid payment method"}, 400)

            partner = self._find_or_create_partner(customer, payload.get("customer_token"))
            order_model = request.env["sale.order"].with_user(SUPERUSER_ID)
            order = order_model.create({
                "partner_id": partner.id,
                "order_line": order_lines,
                "cafe_order": True,
                "cafe_order_type": order_type,
                "cafe_payment_method": payment_method,
                "cafe_status": "PENDING",
                "cafe_delivery_fee": delivery_fee,
                "cafe_customer_note": (customer.get("notes") or "").strip() or False,
                "client_order_ref": "Café Kiaan Website",
            })

            request.env["bus.bus"].sudo()._sendone(
                "cafe_kiaan_new_orders",
                "cafe_kiaan.order_created",
                {
                    "title": "New Café Kiaan Order",
                    "message": f"Order {order.name} from {partner.name or 'customer'} has arrived.",
                    "order_id": order.id,
                    "order_name": order.name,
                },
            )

            # Odoo computes the final monetary fields; read them directly.
            return self._json(self._order_data(order, include_customer_token=True), 201)
        except (KeyError, TypeError, ValueError) as error:
            return self._json({"detail": str(error)}, 400)
        except Exception as error:
            return self._json({"detail": str(error)}, 500)

    @http.route("/cafe-kiaan/api/orders/quote", type="http", auth="public", methods=["POST"], csrf=False, cors=_cors)
    def quote_order(self, **kwargs):
        """Return the same totals Odoo will compute for a future restaurant order.

        The calculation uses a real transient sale.order inside a database savepoint,
        then rolls the transaction back. This keeps the frontend from reimplementing
        Odoo tax logic and makes the preview match the final sale.order totals.
        """
        try:
            payload = json.loads(request.httprequest.data or "{}")
            items = payload.get("items") or []
            order_type = payload.get("order_type") or "delivery"
            if not items or order_type not in ("delivery", "pickup"):
                return self._json({"detail": "Invalid quote payload"}, 400)

            order_lines, delivery_fee, error = self._prepare_order_lines(items, order_type)
            if error:
                return self._json({"detail": error}, 400 if error.startswith("Invalid") else 500)

            customer = dict(payload.get("customer") or {})
            if not (customer.get("name") or "").strip():
                customer["name"] = "Website Tax Preview"

            quote = None
            class _QuoteRollback(Exception):
                pass

            try:
                with request.env.cr.savepoint():
                    partner = self._find_or_create_partner(customer, payload.get("customer_token"))
                    order = request.env["sale.order"].with_user(SUPERUSER_ID).create({
                        "partner_id": partner.id,
                        "order_line": order_lines,
                        "cafe_order": True,
                        "cafe_order_type": order_type,
                        "cafe_payment_method": "cash_on_delivery" if order_type == "delivery" else "cash_on_pickup",
                        "cafe_status": "PENDING",
                        "cafe_delivery_fee": delivery_fee,
                        "cafe_customer_note": False,
                        "client_order_ref": "Café Kiaan Website Tax Preview",
                    })
                    product_lines = order.order_line.filtered(lambda line: line.product_id.product_tmpl_id.cafe_is_menu_item)
                    delivery_lines = order.order_line.filtered(lambda line: line.name == "Delivery Fee")
                    tax_records = order.order_line.mapped("tax_id").filtered(lambda tax: tax.amount)
                    tax_rate = None
                    tax_label = "VAT (0%)"
                    percent_taxes = tax_records.filtered(lambda tax: tax.amount_type == "percent")
                    if len(percent_taxes) == 1 and len(tax_records) == 1:
                        tax_rate = percent_taxes.amount
                        tax_label = "VAT (%g%%)" % tax_rate
                    elif tax_records:
                        names = []
                        for tax in tax_records:
                            label = tax.name or "Tax"
                            if tax.amount_type == "percent":
                                label = "%s (%g%%)" % (label, tax.amount)
                            if label not in names:
                                names.append(label)
                        tax_label = ", ".join(names) or "Tax"

                    quote = {
                        "subtotal": sum(product_lines.mapped("price_subtotal")),
                        "delivery_fee": sum(delivery_lines.mapped("price_subtotal")),
                        "untaxed_total": order.amount_untaxed,
                        "tax": order.amount_tax,
                        "tax_rate": tax_rate,
                        "tax_label": tax_label,
                        "total": order.amount_total,
                    }
                    raise _QuoteRollback()
            except _QuoteRollback:
                pass

            return self._json(quote)
        except (KeyError, TypeError, ValueError) as error:
            return self._json({"detail": str(error)}, 400)
        except Exception as error:
            return self._json({"detail": str(error)}, 500)

    def _prepare_order_lines(self, items, order_type):
        product_model = request.env["product.template"].with_user(SUPERUSER_ID)
        try:
            requested_ids = [int(item.get("menu_item_id")) for item in items]
        except (TypeError, ValueError):
            return [], 0.0, "Invalid item quantity"

        requested_products = product_model.browse(list(dict.fromkeys(requested_ids))).exists()
        menu_products = requested_products.filtered(lambda product: product.cafe_is_menu_item and product.cafe_available and product.sale_ok)
        # A product not marked as a menu item is still orderable when it is explicitly
        # configured by Odoo as an Optional Sales product for one of the requested menu items.
        configured_optional = menu_products.mapped("optional_product_ids")
        order_lines = []
        for item in items:
            product_id = int(item.get("menu_item_id"))
            quantity = int(item.get("quantity", 0))
            if quantity <= 0:
                return [], 0.0, "Invalid item quantity"
            product = product_model.browse(product_id).exists()
            if not product or not product.active or not product.sale_ok:
                return [], 0.0, "One or more selected products are unavailable"
            if product not in menu_products:
                if product not in configured_optional:
                    return [], 0.0, "One or more selected products are not available from the restaurant menu"
            elif not product.cafe_available:
                return [], 0.0, "One or more menu items are unavailable"
            order_lines.append((0, 0, {
                "product_id": product.product_variant_id.with_user(SUPERUSER_ID).id,
                "product_uom_qty": quantity,
                "price_unit": product.list_price,
                "name": product.name,
            }))

        delivery_fee = 0.0
        if order_type == "delivery":
            delivery_product = request.env.ref("cafe_kiaan_restaurant.product_delivery_fee", raise_if_not_found=False)
            delivery_product = delivery_product.with_user(SUPERUSER_ID) if delivery_product else delivery_product
            if not delivery_product:
                return [], 0.0, "Delivery fee product is not configured in Odoo"
            delivery_fee = delivery_product.list_price
            order_lines.append((0, 0, {
                "product_id": delivery_product.product_variant_id.with_user(SUPERUSER_ID).id,
                "product_uom_qty": 1,
                "price_unit": delivery_fee,
                "name": "Delivery Fee",
            }))
        return order_lines, delivery_fee, None

    @http.route("/cafe-kiaan/api/orders/<int:order_id>", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def order(self, order_id, **kwargs):
        # An order ID is not a customer credential. Require the same customer
        # token used by the history endpoint before returning order details.
        token = (kwargs.get("token") or "").strip()
        if not token:
            return self._json({"detail": "Customer token is required"}, 401)

        order = request.env["sale.order"].sudo().search([
            ("id", "=", order_id),
            ("cafe_order", "=", True),
        ], limit=1)
        if not order:
            return self._json({"detail": "Order not found"}, 404)

        partner = request.env["res.partner"].sudo().search([
            ("cafe_web_customer_token", "=", token),
        ], limit=1)
        if not partner or order.partner_id.id != partner.id:
            # Deliberately return the same response used for a missing order so
            # another customer's order cannot be confirmed by probing IDs.
            return self._json({"detail": "Order not found"}, 404)

        return self._json(self._order_data(order))

    @http.route("/cafe-kiaan/api/customer/orders", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def customer_orders(self, **kwargs):
        token = (kwargs.get("token") or "").strip()
        if not token:
            return self._json({"detail": "Customer token is required"}, 400)
        partner = request.env["res.partner"].sudo().search([("cafe_web_customer_token", "=", token)], limit=1)
        if not partner:
            return self._json({"detail": "Customer not found"}, 404)
        orders = request.env["sale.order"].sudo().search([
            ("partner_id", "=", partner.id), ("cafe_order", "=", True)
        ], order="create_date desc, id desc", limit=500)
        history = []
        for order in orders:
            data = self._order_data(order)
            # The token already identifies the customer; do not expose extra contact
            # details through the history endpoint unless the frontend needs them.
            data["customer"] = {"name": order.partner_id.name or ""}
            history.append(data)
        return self._json({
            "customer_token": partner.cafe_web_customer_token,
            "orders": history,
        })

    @http.route("/cafe-kiaan/api/orders", type="http", auth="user", methods=["GET"], csrf=False, cors=_cors)
    def orders(self, **kwargs):
        domain = [("cafe_order", "=", True)]
        if kwargs.get("status"):
            domain.append(("cafe_status", "=", kwargs["status"].upper()))
        orders = request.env["sale.order"].sudo().search(domain, order="create_date desc", limit=500)
        return self._json([self._order_data(order) for order in orders])

    @http.route("/cafe-kiaan/api/orders/<int:order_id>/status", type="http", auth="user", methods=["PATCH"], csrf=False, cors=_cors)
    def update_order_status(self, order_id, **kwargs):
        try:
            payload = json.loads(request.httprequest.data or "{}")
            status = (payload.get("status") or "").upper()
            allowed = {"PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"}
            if status not in allowed:
                return self._json({"detail": "Invalid status"}, 400)
            order = request.env["sale.order"].sudo().search([("id", "=", order_id), ("cafe_order", "=", True)], limit=1)
            if not order:
                return self._json({"detail": "Order not found"}, 404)
            if status == "CONFIRMED" and order.state in ("draft", "sent"):
                order.action_confirm()
            if status == "CANCELLED" and order.state != "cancel":
                order.action_cancel()
            order.cafe_status = status
            return self._json(self._order_data(order))
        except (TypeError, ValueError) as error:
            return self._json({"detail": str(error)}, 400)

    @http.route("/cafe-kiaan/api/health", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def health(self, **kwargs):
        currency = request.env.company.currency_id
        return self._json({
            "ok": True,
            "database": "odoo-postgresql",
            "odoo_version": "17.0",
            "currency_code": currency.name or "",
            "currency_symbol": currency.symbol or "",
        })

    @staticmethod
    def _product_category(item):
        category = item.cafe_menu_category_id.name if item.cafe_menu_category_id else item.cafe_category
        return (category or item.categ_id.name or "Other").strip()

    @staticmethod
    def _image_url(item):
        if item.image_1920:
            base = request.httprequest.host_url.rstrip("/")
            return f"{base}/cafe-kiaan/api/menu/image/{item.id}"
        return item.cafe_image_url or ""

    @http.route("/cafe-kiaan/api/menu/image/<int:item_id>", type="http", auth="public", methods=["GET"], csrf=False, cors=_cors)
    def menu_image(self, item_id, **kwargs):
        item = request.env["product.template"].sudo().browse(item_id).exists()
        if not item or not item.image_1920:
            return Response(status=404)

        image_data = base64.b64decode(item.image_1920)
        mimetype = getattr(item, "image_mimetype", False) or "image/jpeg"
        return Response(
            image_data,
            status=200,
            content_type=mimetype,
            headers=self._cors_headers() + [("Cache-Control", "public, max-age=3600")],
        )

    @classmethod
    def _product_data(cls, item):
        return {
            "id": str(item.id), "name": item.name, "category": cls._product_category(item),
            "description": item.cafe_description or item.description_sale or "", "price": item.list_price,
            "image": cls._image_url(item),
            "fallback_image": item.cafe_image_url or "",
            "available": getattr(item, "cafe_available", True),
            "featured": getattr(item, "cafe_featured", False),
        }

    @classmethod
    def _item_data(cls, item):
        data = cls._product_data(item)
        optional_products = []
        optional_ids = getattr(item, "optional_product_ids", False)
        if optional_ids:
            for optional in optional_ids.filtered(lambda product: product.active and product.sale_ok):
                optional_products.append(cls._product_data(optional))
        data["optional_product_ids"] = [str(product.id) for product in optional_ids] if optional_ids else []
        data["optional_products"] = optional_products
        return data

    @staticmethod
    def _order_data(order, include_customer_token=False):
        lines = []
        delivery_line_total = 0.0
        for line in order.order_line:
            if not line.product_id:
                continue
            product = line.product_id.product_tmpl_id
            if product.cafe_is_menu_item:
                image = CafeKiaanApi._image_url(product)
                lines.append({
                    "menu_item_id": product.id,
                    "name": product.name,
                    "price": line.price_unit,
                    "quantity": line.product_uom_qty,
                    "image": image,
                    "line_subtotal": line.price_subtotal,
                    "line_total": line.price_total,
                })
            elif line.name == "Delivery Fee":
                delivery_line_total += line.price_total

        data = {
            "id": str(order.id),
            "name": order.name,
            "created_at": order.create_date,
            "status": order.cafe_status,
            "customer": {
                "name": order.partner_id.name or "",
                "phone": order.partner_id.phone or "",
                "email": order.partner_id.email or "",
                "address": order.partner_id.contact_address or "",
                "notes": order.cafe_customer_note or "",
            },
            "order_type": order.cafe_order_type,
            "payment_method": order.cafe_payment_method,
            "items": lines,
            "subtotal": sum(line["line_subtotal"] for line in lines),
            "delivery_fee": delivery_line_total or order.cafe_delivery_fee,
            "tax": order.amount_tax,
            "total": order.amount_total,
        }
        if include_customer_token:
            data["customer_token"] = order.partner_id.cafe_web_customer_token
        return data
