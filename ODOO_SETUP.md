# Café Kiaan — Odoo 17 Custom Setup

## Architecture

- Odoo 17 Community = backend/business system
- PostgreSQL = Odoo database
- Next.js = existing customer-facing frontend
- Custom addon = `odoo-addons/cafe_kiaan_restaurant`
- Odoo port = `8070`
- Frontend port = `3000`

The old FastAPI + MongoDB backend is intentionally removed from this final project. Restaurant data is stored in standard Odoo models.

## Odoo modules used

- Sales: restaurant menu and website restaurant orders use `product.template` and `sale.order`
- Purchase: restaurant purchase flag + department
- Inventory: restaurant menu items are standard Odoo products, so inventory can be managed normally
- Point of Sale: restaurant table/order type/kitchen fields are added to `pos.order`

## Install

1. Install Odoo 17 Community and PostgreSQL.
2. Extract this project.
3. Run `START_ODOO.bat`.
4. Open `http://localhost:8070`.
5. Create/select an Odoo database.
6. Enable developer mode if necessary.
7. Apps → Update Apps List.
8. Search for **Café Kiaan Restaurant Customization** and Install.
9. Start the frontend with `START_FRONTEND.bat`.
10. Open `http://localhost:3000`.

## Important

The addon is **not** an independent Odoo application. Its manifest has `application=False` and it extends standard Odoo Sales/Purchase/POS/Product models.

The homepage design is preserved. Only the homepage Hero background image was changed to the supplied Café Kiaan image.

## If Odoo is installed somewhere else

Edit `START_ODOO.bat` and add your actual `odoo-bin` path to the candidate list, or set `ODOO_BIN` directly.

## Existing old Café Kiaan module

If an older version of the custom Café Kiaan module is installed in your database, uninstall that old module before installing this version. Do not delete the whole Odoo database unless you intentionally want a fresh database.
