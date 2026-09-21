# Café Kiaan — Menu & VAT administration

## Create a new menu section
1. Start Odoo normally with `START_ODOO.bat`.
2. Open Odoo Admin at `http://localhost:8070`.
3. Open **Café Kiaan → Menu Categories**.
4. Click **New**.
5. Enter the section name (for example, `Water`) and save it.
6. The section is stored in Odoo/PostgreSQL. Refresh `http://localhost:3000/menu`; no frontend code change, Next.js restart, or Odoo restart is required.
7. To put products in the section, open the product in **Café Kiaan → Restaurant Menu Products** (or the product form), enable **Café Menu Item**, select **Menu Section**, and save.

## Reorder menu sections
1. Open **Café Kiaan → Menu Categories**.
2. Use the handle at the left of each row to drag the section up or down.
3. Odoo saves the `sequence` value in PostgreSQL.
4. Refresh the website. The category navigation on the homepage and menu page uses the Odoo sequence.

## Delete and restore a section
1. Open **Café Kiaan → Menu Categories**.
2. Open a section and click **Delete**, or use Odoo's delete action.
3. The deleted section and its product assignments remain stored; the website excludes deleted sections and their menu products.
5. Open the section and click **Restore**.
6. Refresh the website. The section and its products are visible again with the saved order value.

## Delivery-fee VAT
The Café Kiaan delivery-fee product is configured without customer taxes in Odoo. Café Kiaan delivery lines are also guarded in `sale.order.line` so fiscal-position mapping cannot add VAT to the delivery fee. The quote endpoint and final sale order both use Odoo's tax engine.
