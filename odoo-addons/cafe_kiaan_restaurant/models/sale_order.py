import logging

import requests

from odoo import api, fields, models
from odoo.exceptions import UserError


_logger = logging.getLogger(__name__)

# SMS integration is intentionally disabled in this project.


def _normalize_bd_phone(phone):
    phone = (phone or "").strip().replace(" ", "").replace("-", "")

    if phone.startswith("+880"):
        return phone[1:]
    if phone.startswith("880"):
        return phone
    if phone.startswith("01"):
        return "88" + phone
    return phone


def _send_completion_sms(phone, order_name):
    phone = _normalize_bd_phone(phone)
    if not phone:
        _logger.warning("Order %s was completed but the customer has no phone number.", order_name)
        return False

    # params = {
    #     "apikey": SMS_API_KEY,
    #     "sender": SMS_SENDER,
    #     "msisdn": phone,
    #     "smstext": "Order Successfully completed",
    # }

    # try:
    #     response = requests.get(SMS_API_URL, params=params, timeout=15)
    #     response.raise_for_status()
    #     _logger.info(
    #         "Completion SMS request sent for order %s to %s. HTTP %s. Response: %s",
    #         order_name,
    #         phone,
    #         response.status_code,
    #         response.text,
    #     )
    #     return True
    # except requests.RequestException:
    #     _logger.exception(
    #         "Failed to send completion SMS for order %s to %s.",
    #         order_name,
    #         phone,
    #     )
    #     return False

    return True


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model_create_multi
    def create(self, vals_list):
        bdt = self.env["res.currency"].sudo().search([("name", "=", "BDT")], limit=1)
        bdt_pricelist = self.env["product.pricelist"]
        if bdt:
            company = self.env.company
            bdt_pricelist = self.env["product.pricelist"].sudo().search([
                ("currency_id", "=", bdt.id),
                "|", ("company_id", "=", False), ("company_id", "=", company.id),
                ("active", "=", True),
            ], order="company_id desc, id", limit=1)
            if bdt_pricelist:
                for vals in vals_list:
                    if vals.get("cafe_order") and not vals.get("pricelist_id"):
                        vals["pricelist_id"] = bdt_pricelist.id
        orders = super().create(vals_list)
        if bdt and bdt_pricelist:
            cafe_orders = orders.filtered(lambda order: order.cafe_order and order.currency_id != bdt)
            for order in cafe_orders:
                # Sale orders derive their pricelist from the partner during precompute.
                # Re-assert BDT for newly-created Café Kiaan website orders so their stored
                # currency and subsequent customer emails cannot fall back to USD.
                order.with_company(order.company_id).write({"pricelist_id": bdt_pricelist.id})
                order._recompute_prices()
        return orders

    def _cafe_email_amount_bdt_formatted(self):
        """Display-only email label: keep the existing order amount and replace $ with BDT."""
        self.ensure_one()
        return f"BDT {self.amount_total:,.2f}"

    def _cafe_email_template(self):
        return self.env.ref(
            "cafe_kiaan_restaurant.mail_template_cafe_order_confirmation",
            raise_if_not_found=False,
        )

    def _cafe_email_layout_xmlid(self):
        return "cafe_kiaan_restaurant.cafe_kiaan_mail_notification_layout_v4"

    def _notify_by_email_prepare_rendering_context(self, message, msg_vals=False, model_description=False,
                                                   force_email_company=False, force_email_lang=False):
        """Suppress the duplicate order-total subtitle for Café Kiaan emails.

        Odoo's standard sale.order notification context adds the order total to ``subtitles``.
        The Café Kiaan layout already renders the single BDT amount in its header, so only the
        order reference is kept in ``subtitles`` to prevent a second amount from appearing.
        """
        render_context = super()._notify_by_email_prepare_rendering_context(
            message, msg_vals, model_description=model_description,
            force_email_company=force_email_company, force_email_lang=force_email_lang,
        )
        if self.cafe_order:
            record = render_context.get('record', self)
            render_context['subtitles'] = [record.name]
        return render_context

    def _notify_by_email_render_layout(self, message, recipients_group, msg_vals=False, render_values=None):
        """Force Café Kiaan notifications to use the project-owned email layout.

        This covers notification paths where an existing database template/composer still carries
        a standard Odoo layout value. Other Odoo mail notifications keep their normal behavior.
        """
        if self.cafe_order:
            msg_vals = dict(msg_vals or {})
            msg_vals['email_layout_xmlid'] = self._cafe_email_layout_xmlid()
        return super()._notify_by_email_render_layout(
            message, recipients_group, msg_vals=msg_vals, render_values=render_values,
        )

    cafe_order = fields.Boolean(string="Restaurant Order", default=False, index=True, copy=False)
    cafe_order_type = fields.Selection(
        [("delivery", "Delivery"), ("pickup", "Pickup")],
        string="Order Type",
        default="pickup",
        index=True,
    )
    cafe_payment_method = fields.Selection(
        [("cash_on_delivery", "Cash on Delivery"), ("cash_on_pickup", "Cash on Pickup")],
        string="Restaurant Payment",
        default="cash_on_pickup",
    )
    cafe_status = fields.Selection(
        [
            ("PENDING", "Pending"),
            ("CONFIRMED", "Confirmed"),
            ("PREPARING", "Preparing"),
            ("READY", "Ready"),
            ("OUT_FOR_DELIVERY", "Out for Delivery"),
            ("COMPLETED", "Completed"),
            ("CANCELLED", "Cancelled"),
        ],
        string="Kitchen Status",
        default="PENDING",
        index=True,
        copy=False,
    )
    cafe_delivery_fee = fields.Monetary(string="Delivery Fee", currency_field="currency_id", copy=False)
    cafe_customer_note = fields.Text(string="Restaurant Customer Note")

    @api.onchange("cafe_order_type")
    def _onchange_cafe_order_type(self):
        if self.cafe_order_type != "delivery":
            self.cafe_delivery_fee = 0.0
        elif not self.cafe_delivery_fee:
            delivery_product = self.env.ref("cafe_kiaan_restaurant.product_delivery_fee", raise_if_not_found=False)
            self.cafe_delivery_fee = delivery_product.list_price if delivery_product else 0.0

    def action_quotation_send(self):
        action = super().action_quotation_send()
        if self.cafe_order:
            context = dict(action.get("context") or {})
            context.update({
                "default_email_layout_xmlid": self._cafe_email_layout_xmlid(),
            })
            action["context"] = context
        return action

    def _send_order_notification_mail(self, mail_template):
        if self.cafe_order:
            return self.with_context(force_send=True).message_post_with_source(
                mail_template,
                email_layout_xmlid=self._cafe_email_layout_xmlid(),
                subtype_xmlid="mail.mt_comment",
            )
        return super()._send_order_notification_mail(mail_template)

    def _cafe_set_status(self, expected, new_status):
        for order in self:
            if order.cafe_status != expected:
                raise UserError("This restaurant order is not in the expected stage.")
            order.cafe_status = new_status
        return True

    def action_cafe_confirm(self):
        for order in self:
            if order.state in ("draft", "sent"):
                order.action_confirm()
        return self._cafe_set_status("PENDING", "CONFIRMED")

    def action_cafe_start_preparing(self):
        return self._cafe_set_status("CONFIRMED", "PREPARING")

    def action_cafe_mark_ready(self):
        return self._cafe_set_status("PREPARING", "READY")

    def action_cafe_dispatch(self):
        for order in self:
            if order.cafe_order_type != "delivery":
                raise UserError("Only delivery orders can be dispatched.")
        return self._cafe_set_status("READY", "OUT_FOR_DELIVERY")

    def action_cafe_complete(self):
        for order in self:
            if order.cafe_status == "READY" and order.cafe_order_type == "pickup":
                order.cafe_status = "COMPLETED"
            elif order.cafe_status == "OUT_FOR_DELIVERY":
                order.cafe_status = "COMPLETED"
            else:
                raise UserError("The order is not ready to be completed.")

            # Send the completion SMS only after the order has been marked completed.
            _send_completion_sms(order.partner_id.phone, order.name)

        return True

    def action_cafe_cancel(self):
        for order in self:
            if order.cafe_status not in ("COMPLETED", "CANCELLED"):
                order.action_cancel()
                order.cafe_status = "CANCELLED"
        return True
