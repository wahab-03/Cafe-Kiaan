# Café Kiaan maintenance tools

## Repair the Odoo `/web` asset error

The bundled Odoo log identified one generated asset attachment that exists in
`ir.attachment` but whose `store_fname` file is missing from the database
filestore. The repair is deliberately narrow: it removes only that exact
orphaned attachment, allowing Odoo to regenerate the bundle on the next web
request.

`START_ODOO.ps1` runs this repair automatically before starting the Odoo HTTP
server. The normal project startup path is `START_ODOO.bat`; no separate repair command is required.
