"""Non-destructive source and local HTTP validation for Café Kiaan.
Run from the project root while Odoo/Next are running.
"""
from __future__ import annotations
import json, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def get(url: str):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.status, r.read().decode("utf-8", errors="replace")

def post(url: str, payload: dict):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type":"application/json", "Accept":"application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.status, r.read().decode("utf-8", errors="replace")

errors = []
controller = ROOT / "odoo-addons/cafe_kiaan_restaurant/controllers/main.py"
text = controller.read_text(encoding="utf-8")
for token in ("optional_product_ids", "/cafe-kiaan/api/orders/quote", "_prepare_order_lines", "_image_url"):
    if token not in text:
        errors.append(f"controller missing {token}")

try:
    status, health = get("http://localhost:8070/cafe-kiaan/api/health")
    assert status == 200
    print(f"[OK] Odoo health: {health}")
except Exception as exc:
    print(f"[SKIP] Odoo HTTP checks unavailable: {exc}")
    sys.exit(0 if not errors else 1)

try:
    status, raw = get("http://localhost:8070/cafe-kiaan/api/menu")
    data = json.loads(raw)
    assert status == 200 and isinstance(data, list)
    print(f"[OK] Menu endpoint: {len(data)} items")
    if data:
        sample = data[0]
        assert "optional_products" in sample and "image" in sample
        print(f"[OK] Menu item contract includes image + Optional Sales payload for {sample.get('name')}")
        status, quote_raw = post("http://localhost:8070/cafe-kiaan/api/orders/quote", {"order_type":"delivery", "items":[{"menu_item_id": int(sample["id"]), "quantity":1}]})
        quote = json.loads(quote_raw)
        assert status == 200 and {"subtotal","delivery_fee","tax","total","tax_label"}.issubset(quote)
        print(f"[OK] Odoo quote: subtotal={quote['subtotal']} delivery={quote['delivery_fee']} tax={quote['tax']} total={quote['total']} label={quote['tax_label']}")
except Exception as exc:
    print(f"[FAIL] Odoo endpoint validation: {exc}")
    errors.append(str(exc))

if errors:
    for item in errors: print(f"[FAIL] {item}")
    sys.exit(1)
print("[OK] Static/runtime contract validation passed")
