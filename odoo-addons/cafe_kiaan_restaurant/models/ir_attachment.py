import os
import logging

from odoo import api, models

_logger = logging.getLogger(__name__)


class IrAttachment(models.Model):
    _inherit = "ir.attachment"

    @api.model
    def cafe_kiaan_repair_missing_asset_bundles(self):
        """Remove only broken generated web-asset attachments.

        Odoo keeps generated web bundles as public ir.attachment records and stores
        their content in the database filestore. After a project/database move,
        a bundle can remain in PostgreSQL while its checksum file is missing on
        disk. That makes /web/assets/... return 500 and leaves the whole backend
        without CSS/JS. Odoo will regenerate these bundles on the next request once
        the stale asset attachment records are removed.
        """
        candidates = self.sudo().search([
            ("type", "=", "binary"),
            ("url", "=like", "/web/assets/%"),
            ("res_model", "=", "ir.ui.view"),
            ("res_id", "=", 0),
            ("create_uid", "=", api.SUPERUSER_ID),
            ("store_fname", "!=", False),
        ])
        broken = self.browse()
        for attachment in candidates:
            try:
                path = attachment._full_path(attachment.store_fname)
            except Exception:
                _logger.exception("Could not resolve filestore path for asset attachment %s", attachment.id)
                continue
            if not os.path.isfile(path):
                broken |= attachment

        if broken:
            count = len(broken)
            urls = broken.mapped("url")
            broken.unlink()
            self.env.registry.clear_cache("assets")
            _logger.warning(
                "Café Kiaan repaired %s missing generated web asset attachment(s): %s",
                count,
                ", ".join(urls[:8]),
            )
        return True
