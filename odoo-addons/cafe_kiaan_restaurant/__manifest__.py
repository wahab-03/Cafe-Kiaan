{
    "name": "Café Kiaan Restaurant Customization",
    "version": "17.0.1.6.0",
    "category": "Sales/Restaurant",
    "summary": "Restaurant customization for standard Odoo Sales, Purchase, Inventory and POS",
    "description": "Uses Odoo standard products, sale orders, purchase orders and POS orders instead of a separate Café Kiaan application.",
    "depends": ["base", "mail", "bus", "product", "sale_management", "sale_product_configurator", "purchase", "stock", "point_of_sale"],
    "data": [
        "security/ir.model.access.csv",
        "data/legacy_cleanup.xml",
        "data/restaurant_data.xml",
        "data/cafe_email.xml",
        "data/cafe_email_layout_binding.xml",
        "views/product_views.xml",
        "views/menu_category_views.xml",
        "views/sale_order_views.xml",
        "views/purchase_order_views.xml",
        "views/pos_order_views.xml",
    ],
    "installable": True,
    "application": True,
    "assets": {
        "web.assets_backend": [
            "cafe_kiaan_restaurant/static/src/js/cafe_order_sound.js",
        ],
    },
    "license": "LGPL-3",
}
