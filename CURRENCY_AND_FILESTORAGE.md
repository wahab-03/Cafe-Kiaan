# Café Kiaan currency, file storage, and email safety

## Currency

Café Kiaan uses the Odoo BDT currency (`BDT`, symbol `৳`). The module keeps the main company and its company/global pricelists aligned to BDT so new restaurant sales use the correct currency.

The website displays prices with `৳`. The email sending layer also replaces the legacy Odoo dollar fallback in Café Kiaan sale-order notifications with Odoo's actual formatted BDT amount when the order currency is BDT.

## Email logo

The standard Odoo notification layout can use `/logo.png?company=...`. That URL is valid inside Odoo, but a Gmail recipient cannot fetch a Windows `localhost` URL. Café Kiaan now post-processes outgoing restaurant-order email HTML and replaces that local logo reference with an embedded data URI generated from the company logo stored in Odoo. No external localhost request is required by the recipient.

## Filestore

The project keeps its Odoo data in `odoo-local-data`, including `filestore/cafe_kiaan`. When the project is moved or copied, keep the entire `odoo-local-data` directory with it. The startup/repair tooling only targets generated Odoo web-asset bundles when their checksum files are missing; ordinary product images, company logos, PDFs, customer files, and other business attachments are not removed merely because a file is unavailable.
