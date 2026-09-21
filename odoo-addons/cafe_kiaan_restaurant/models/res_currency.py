from odoo import api, models


class ResCompany(models.Model):
    _inherit = "res.company"

    @api.model
    def cafe_kiaan_configure_bdt_currency(self):
        """Keep the Café Kiaan company's monetary display in Bangladesh Taka."""
        bdt = self.env["res.currency"].sudo().search([("name", "=", "BDT")], limit=1)
        if not bdt:
            return False

        if not bdt.active or bdt.symbol != "৳" or bdt.position != "before":
            bdt.write({"active": True, "symbol": "৳", "position": "before"})

        main_company = self.env.ref("base.main_company", raise_if_not_found=False)
        if not main_company:
            main_company = self.sudo().search([], order="id", limit=1)
        if not main_company:
            return True

        main_company.sudo().write({"currency_id": bdt.id})

        # Café Kiaan is a single-business project. Keep its generic/company
        # pricelists in the same currency so new Sales Orders use BDT too.
        pricelists = self.env["product.pricelist"].sudo().search([
            "|", ("company_id", "=", False), ("company_id", "=", main_company.id)
        ])
        if pricelists:
            pricelists.write({"currency_id": bdt.id})
        return True
