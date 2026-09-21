from odoo import api, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    cafe_is_menu_item = fields.Boolean(string="Café Menu Item", default=False, index=True)
    cafe_category = fields.Char(string="Restaurant Category", index=True)
    cafe_menu_category_id = fields.Many2one(
        "cafe.menu.category",
        string="Menu Section",
        index=True,
        ondelete="set null",
    )
    cafe_description = fields.Text(string="Restaurant Description")
    cafe_image_url = fields.Char(string="Menu Image URL")
    cafe_available = fields.Boolean(string="Available on Menu", default=True, index=True)
    cafe_featured = fields.Boolean(string="Featured Item", default=False, index=True)

    @api.model
    def cafe_kiaan_configure_delivery_fee_tax_exemption(self):
        delivery_product = self.env.ref(
            "cafe_kiaan_restaurant.product_delivery_fee",
            raise_if_not_found=False,
        )
        if not delivery_product:
            return False
        # Delivery fee is a real sale-order product, so keep its Odoo customer
        # taxes empty. The sale.order.line safeguard also prevents Café Kiaan
        # delivery lines from receiving taxes through fiscal-position mapping.
        delivery_product.sudo().write({"taxes_id": False})
        return True

    def _cafe_category_from_name(self, name):
        return self.env["cafe.menu.category"].get_or_create_from_name(name)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if self.env.context.get("cafe_restaurant_menu_context"):
                vals.setdefault("cafe_is_menu_item", True)
                vals.setdefault("cafe_available", True)
                vals.setdefault("sale_ok", True)
            category_id = vals.get("cafe_menu_category_id")
            category_name = (vals.get("cafe_category") or "").strip()
            if category_id:
                category = self.env["cafe.menu.category"].browse(category_id).exists()
                if category:
                    vals["cafe_category"] = category.name
            elif category_name:
                category = self._cafe_category_from_name(category_name)
                if category:
                    vals["cafe_menu_category_id"] = category.id
            elif vals.get("cafe_is_menu_item") and vals.get("categ_id"):
                legacy_category = self.env["product.category"].browse(vals["categ_id"]).exists()
                if legacy_category:
                    vals["cafe_category"] = legacy_category.name
                    category = self._cafe_category_from_name(legacy_category.name)
                    if category:
                        vals["cafe_menu_category_id"] = category.id
        return super().create(vals_list)

    def write(self, vals):
        vals = dict(vals)
        category_id = vals.get("cafe_menu_category_id")
        category_name = vals.get("cafe_category")
        if category_id:
            category = self.env["cafe.menu.category"].browse(category_id).exists()
            if category:
                vals["cafe_category"] = category.name
        elif "cafe_menu_category_id" in vals and not category_id:
            vals["cafe_category"] = False
        elif category_name is not None and not self.env.context.get("skip_cafe_category_sync"):
            category_name = (category_name or "").strip()
            if category_name:
                category = self._cafe_category_from_name(category_name)
                vals["cafe_menu_category_id"] = category.id if category else False
            else:
                vals["cafe_menu_category_id"] = False

        result = super().write(vals)
        if "categ_id" in vals and not category_id and "cafe_category" not in vals:
            for product in self:
                if product.cafe_is_menu_item:
                    legacy_category = product.categ_id.exists()
                    if legacy_category:
                        category = self._cafe_category_from_name(legacy_category.name)
                        product.with_context(skip_cafe_category_sync=True).write({
                            "cafe_category": legacy_category.name or product.cafe_category or False,
                            "cafe_menu_category_id": category.id if category else False,
                        })
        return result
