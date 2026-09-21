from odoo import api, fields, models
from odoo.exceptions import ValidationError


class CafeMenuCategory(models.Model):
    _name = "cafe.menu.category"
    _description = "Café Kiaan Menu Category"
    _order = "sequence, id"
    _rec_name = "name"

    name = fields.Char(string="Section Name", required=True, index=True)
    sequence = fields.Integer(string="Order", default=10, index=True)
    active = fields.Boolean(string="Active", default=True, index=True)
    product_ids = fields.One2many(
        "product.template",
        "cafe_menu_category_id",
        string="Menu Products",
    )

    _sql_constraints = [
        ("cafe_menu_category_name_uniq", "unique(name)", "Menu section names must be unique."),
    ]

    @api.constrains("name")
    def _check_name(self):
        for category in self:
            if not (category.name or "").strip():
                raise ValidationError("Menu section name cannot be empty.")

    @api.model
    def _next_sequence(self):
        last = self.sudo().search([], order="sequence desc, id desc", limit=1)
        return (last.sequence or 0) + 10 if last else 10

    @api.model
    def get_or_create_from_name(self, name):
        name = (name or "").strip()
        if not name:
            return self.browse()
        category = self.sudo().search([("name", "=", name)], limit=1)
        if not category:
            category = self.sudo().create({"name": name, "sequence": self._next_sequence()})
        return category

    @api.model
    def sync_legacy_categories(self):
        """Migrate the existing Char category values into persistent menu records."""
        Product = self.env["product.template"].sudo()
        products = Product.search([
            ("cafe_is_menu_item", "=", True),
            ("cafe_category", "!=", False),
        ])
        for product in products:
            if product.cafe_menu_category_id:
                continue
            category = self.get_or_create_from_name(product.cafe_category)
            if category:
                product.with_context(skip_cafe_category_sync=True).write({
                    "cafe_menu_category_id": category.id,
                })
        return True

    def write(self, vals):
        result = super().write(vals)
        if "name" in vals and not self.env.context.get("skip_cafe_category_sync"):
            for category in self:
                category.product_ids.with_context(skip_cafe_category_sync=True).write({
                    "cafe_category": category.name,
                })
        return result

    def unlink(self):
        """Permanently delete menu sections when Odoo Delete is used.

        Product assignments are safely cleared by the product relation's
        ``ondelete="set null"`` policy; product records themselves are not
        deleted.
        """
        return super().unlink()

    def action_archive(self):
        self.write({"active": False})
        return True

    def action_restore(self):
        self.write({"active": True})
        return True
