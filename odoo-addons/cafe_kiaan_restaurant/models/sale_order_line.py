from odoo import models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    def _compute_tax_id(self):
        super()._compute_tax_id()
        delivery_product = self.env.ref(
            "cafe_kiaan_restaurant.product_delivery_fee",
            raise_if_not_found=False,
        )
        if not delivery_product:
            return
        delivery_variant = delivery_product.product_variant_id
        delivery_lines = self.filtered(
            lambda line: line.order_id.cafe_order and line.product_id == delivery_variant
        )
        delivery_lines.tax_id = False
