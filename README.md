# Café Kiaan — Odoo 17 + Next.js Full Project

This project uses **Odoo 17 as the backend** and the original Next.js frontend as the customer website. The Café Kiaan customization extends standard Odoo models instead of creating a separate restaurant database model system.

## Main architecture

- Frontend: Next.js 14 / React 18
- Backend: Odoo 17 Community
- Database: PostgreSQL 17
- Custom Odoo addon: `cafe_kiaan_restaurant`
- Menu: `product.template`
- Website orders: `sale.order`
- Customers: `res.partner`
- Purchases: `purchase.order`
- POS metadata: `pos.order`

## Run on Windows

1. Install Odoo 17 Community and PostgreSQL 17.
2. Make sure PostgreSQL service is running.
3. Stop the Odoo Windows service if it is already using port 8070.
4. Open **Administrator PowerShell** in this project folder.
5. Run `START_ODOO.bat`.
6. Open `http://localhost:8070` and install/upgrade **Café Kiaan Restaurant Customization** from Apps.
7. Open a second terminal and run `START_FRONTEND.bat`.
8. Open `http://localhost:3000`.

The frontend launcher checks for `node_modules\\.bin\\next.cmd`; if it is missing it runs `npm ci` automatically. `node_modules` is intentionally not bundled in the ZIP.

## Website order flow

Website → Place Order → Odoo API → `res.partner` + `sale.order` + `sale.order.line` → restaurant status/staff operations.

The project includes `FULL_PROJECT_RUNTIME_CHECK.bat` for local runtime checks after both servers are running.


## Stable local Odoo storage

The normal launcher uses the project-local `odoo-local-data` directory, including `filestore/cafe_kiaan`. Move/copy the entire project folder together with this directory. During the normal module update, Café Kiaan checks only generated `/web/assets/...` attachment records and removes an asset record when its checksum file is missing, allowing Odoo to regenerate the CSS/JS bundle.

The Café Kiaan company and its project pricelists are configured for BDT (`৳`).
