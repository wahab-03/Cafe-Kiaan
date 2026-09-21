from odoo import api, models


class IrActionsActWindow(models.Model):
    _inherit = "ir.actions.act_window"

    @api.model
    def cafe_cleanup_legacy_actions(self):
        legacy_actions = self.sudo().search([
            ("res_model", "in", ["cafe.menu.item", "cafe.order", "cafe.order.line"]),
        ])
        if not legacy_actions:
            return
        action_refs = {f"ir.actions.act_window,{action.id}" for action in legacy_actions}
        menus = self.env["ir.ui.menu"].sudo().search([]).filtered(lambda menu: menu.action in action_refs)
        menus.write({"action": False})