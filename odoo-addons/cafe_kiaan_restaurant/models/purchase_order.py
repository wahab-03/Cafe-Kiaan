from odoo import fields, models


class PurchaseOrder(models.Model):
    _inherit = "purchase.order"

    cafe_purchase = fields.Boolean(string="Restaurant Purchase", default=False, index=True)
    cafe_department = fields.Selection(
        [
            ("kitchen", "Kitchen"),
            ("beverage", "Beverage / Coffee"),
            ("packaging", "Packaging"),
            ("cleaning", "Cleaning"),
            ("other", "Other"),
        ],
        string="Restaurant Department",
        default="kitchen",
    )
