import secrets

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    cafe_web_customer_token = fields.Char(
        string="Café Kiaan Web Customer Token",
        index=True,
        copy=False,
        readonly=True,
    )
    cafe_web_password_hash = fields.Char(
        string="Café Kiaan Web Password Hash",
        copy=False,
        readonly=True,
    )

    def _ensure_cafe_web_customer_token(self):
        for partner in self:
            if not partner.cafe_web_customer_token:
                partner.cafe_web_customer_token = secrets.token_urlsafe(32)
        return self
