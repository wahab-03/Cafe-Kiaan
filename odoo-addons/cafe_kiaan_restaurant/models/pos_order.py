from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    cafe_order = fields.Boolean(string="Restaurant Order", default=True, index=True)
    cafe_table = fields.Char(string="Restaurant Table")
    cafe_order_type = fields.Selection(
        [("dine_in", "Dine In"), ("takeaway", "Takeaway"), ("delivery", "Delivery")],
        string="Restaurant Order Type",
        default="dine_in",
    )
    cafe_kitchen_status = fields.Selection(
        [("PENDING", "Pending"), ("PREPARING", "Preparing"), ("READY", "Ready"), ("COMPLETED", "Completed")],
        string="Kitchen Status",
        default="PENDING",
    )
