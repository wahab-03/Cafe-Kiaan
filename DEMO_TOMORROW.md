# Café Kiaan — কালকের Demo

## Current PC

- Odoo 17: installed
- PostgreSQL 17: running
- Project Odoo port: `8070`
- Frontend port: `3000`

## Important

A previous Odoo instance is also visible on `8069`. For this project, use **8070** only.

## First-time migration from the old module

The old module used the technical model `cafe.menu.item`. The final project does **not** use that model. It uses standard Odoo models such as `product.template` and `sale.order`.

If the old **Café Kiaan Ordering** module is still installed, uninstall that old module first. Then:

1. Apps → Update Apps List
2. Install **Café Kiaan Restaurant Customization**
3. Start the frontend
4. Open `http://localhost:3000`

## Demo checklist

- Homepage loads
- Supplied Café Kiaan hero picture is fully visible on desktop
- Menu comes from Odoo products
- Menu images load
- Cart works
- Checkout creates a standard Odoo Sales Order
- Sales → Restaurant Orders shows website orders
- Sales → Restaurant Menu shows standard Odoo products
- Order status can be progressed from pending to completed
- Purchase module includes Restaurant Purchases
- POS form contains restaurant metadata fields
