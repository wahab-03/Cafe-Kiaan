# Café Kiaan Odoo file storage

Café Kiaan keeps the database in PostgreSQL and keeps Odoo's file attachments/generated assets in the project-local `odoo-local-data` directory.

When moving/copying the project, move the **entire project folder**, including:

- `odoo-local-data/filestore/cafe_kiaan/`
- the Odoo addon under `odoo-addons/`

The database itself remains in PostgreSQL. The database and filestore are a pair: PostgreSQL stores attachment metadata/checksums while the filestore stores the binary files.

The launcher also runs a safe Odoo preflight during the normal module upgrade. It removes **only** generated `/web/assets/...` attachment records whose checksum file is actually missing from the configured filestore. Odoo then regenerates those bundles on the next web request.

It does not delete ordinary product images, company logos, customer attachments, PDFs, or other business documents just because a file is missing.
