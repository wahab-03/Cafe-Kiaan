"""Static validation for the current Café Kiaan requirements.
Run from the project root. Runtime/API checks should be run separately when Odoo is available.
"""
from __future__ import annotations

import ast
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADDON = ROOT / "odoo-addons" / "cafe_kiaan_restaurant"
errors: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)

manifest = ast.literal_eval((ADDON / "__manifest__.py").read_text(encoding="utf-8"))
require("views/menu_category_views.xml" in manifest["data"], "menu category view is not in manifest")
require("data/restaurant_data.xml" in manifest["data"], "restaurant_data.xml is missing")

for path in ADDON.rglob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
for path in ADDON.rglob("*.xml"):
    ET.parse(path)

category_model = (ADDON / "models" / "menu_category.py").read_text(encoding="utf-8")
product_model = (ADDON / "models" / "product_template.py").read_text(encoding="utf-8")
sale_line = (ADDON / "models" / "sale_order_line.py").read_text(encoding="utf-8")
controller = (ADDON / "controllers" / "main.py").read_text(encoding="utf-8")
category_view = (ADDON / "views" / "menu_category_views.xml").read_text(encoding="utf-8")
product_view = (ADDON / "views" / "product_views.xml").read_text(encoding="utf-8")
restaurant_data = (ADDON / "data" / "restaurant_data.xml").read_text(encoding="utf-8")
frontend_categories = (ROOT / "frontend" / "components" / "MenuCategories.jsx").read_text(encoding="utf-8")
menu_page = (ROOT / "frontend" / "app" / "menu" / "page.jsx").read_text(encoding="utf-8")
checkout = (ROOT / "frontend" / "app" / "checkout" / "page.jsx").read_text(encoding="utf-8")
cart = (ROOT / "frontend" / "app" / "cart" / "page.jsx").read_text(encoding="utf-8")

require('_name = \"cafe.menu.category\"' in category_model, "menu category model missing")
require('sequence = fields.Integer' in category_model and '_order = "sequence, id"' in category_model, "persistent category sequence missing")
require('active = fields.Boolean' in category_model, "category active/archive field missing")
require('def unlink' in category_model and 'return super().unlink()' in category_model, "category hard-delete support missing")
require('cafe_menu_category_id = fields.Many2one' in product_model, "product menu category relation missing")
require('widget="handle"' in category_view and 'field name="sequence"' in category_view, "drag/drop sequence widget missing")
require('id="action_cafe_menu_categories"' in category_view, "menu category action missing")
require('id="menu_cafe_menu_categories"' in category_view, "menu category admin menu missing")
require('id="action_cafe_menu_categories_archived"' in category_view and 'Archived Menu Sections' in category_view, "archived menu UI is missing")
require('cafe_menu_category_id' in product_view, "product form does not expose Menu Section")
require('"/cafe-kiaan/api/menu/categories"' in controller, "category API missing")
require('order="sequence, id"' in controller, "category API is not sequence ordered")
require('cafe_menu_category_id.active' in controller, "website product API does not exclude archived categories")
require('taxes_id' in restaurant_data and '[(5, 0, 0)]' in restaurant_data, "delivery product taxes are not explicitly cleared")
require('def _compute_tax_id' in sale_line and 'delivery_lines.tax_id = False' in sale_line, "delivery line VAT exclusion safeguard missing")
require('api.categories()' not in frontend_categories, "homepage must preserve curated/original category behavior")
require('api.categories()' in menu_page, "menu page categories are not fetched dynamically")
require('api.quoteOrder' in checkout and 'quote?.tax' in checkout, "checkout VAT is not Odoo-quote driven")
require('api.quoteOrder' in cart and 'quote?.tax' in cart, "cart VAT is not Odoo-quote driven")
require('optional_product_ids' in controller, "Optional Sales integration missing")
require('image_1920' in controller, "dynamic Odoo image handling missing")

if errors:
    for error in errors:
        print(f"[FAIL] {error}")
    raise SystemExit(1)

print("[PASS] Café Kiaan current requirement static validation passed")
print("[PASS] Odoo Python AST validation passed")
print("[PASS] Odoo XML well-formed validation passed")
print("[PASS] VAT delivery-line safeguard present")
print("[PASS] Persistent menu category + sequence + hard-delete behavior present")
print("[PASS] Odoo-driven category API + curated homepage/dynamic menu integration present")
print("[PASS] Existing Optional Sales + dynamic image paths remain present")
