# Café Kiaan API Contract

The API is served by Odoo 17 at `http://localhost:8070/cafe-kiaan/api`.

Endpoints:

- `GET /menu`
- `GET /menu/categories`
- `GET /menu/category/<category>`
- `POST /orders`
- `GET /orders` (authenticated Odoo user/admin endpoint)
- `PATCH /orders/<id>/status` (authenticated Odoo user/admin endpoint)
- `GET /health`

There is no independent FastAPI backend in this final architecture.


## Customer order history

`GET /cafe-kiaan/api/customer/orders?token=<customer_token>` returns the orders belonging to the same web customer. The token is returned by a successful `POST /cafe-kiaan/api/orders` response and is stored client-side only as the customer session identifier.

Each history order includes its Odoo order name, creation time, status, item lines, subtotal, delivery fee, tax and the final Odoo `amount_total`. The endpoint does not expose the customer's phone, email, address or notes.
