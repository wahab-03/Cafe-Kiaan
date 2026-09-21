# Café Kiaan — Odoo 17 for Render (demo)
# Built from the repo root. Only the custom addon is copied in; the database
# comes from Render Postgres, so nothing local is baked into the image.
FROM odoo:17.0

USER root
COPY odoo-addons/cafe_kiaan_restaurant /opt/extra-addons/cafe_kiaan_restaurant
COPY render-start.sh /render-start.sh
# Strip Windows line endings (CRLF) in case Git checked the script out that way.
RUN sed -i 's/\r$//' /render-start.sh \
    && chmod +x /render-start.sh \
    && chown -R odoo:odoo /opt/extra-addons

USER odoo
ENTRYPOINT ["/render-start.sh"]
CMD []
