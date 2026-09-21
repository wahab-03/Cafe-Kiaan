# Backend Runbook

The backend runtime is Odoo 17 Community. From the project root, use `START_ODOO.bat`. This folder exists so a reviewer can immediately identify where the backend documentation and helper live.

## URLs

- Odoo: `http://localhost:8070`
- API health: `http://localhost:8070/cafe-kiaan/api/health`
- Frontend: `http://localhost:3000`

## Data flow

1. Next.js calls the Odoo HTTP controller.
2. Odoo validates the request.
3. Products are read from `product.template`.
4. Customers are stored in `res.partner`.
5. Website orders are created as `sale.order`.
6. Purchases use `purchase.order`.
7. POS metadata uses `pos.order`.
8. PostgreSQL stores the Odoo database.
