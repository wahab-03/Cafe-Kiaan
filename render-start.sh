#!/bin/bash
# Starts Odoo on Render. Deliberately does NOT use the official image's
# entrypoint: that one reads the PORT variable as the *database* port, which
# clashes with Render's PORT (the port the web service must listen on).
set -eu

: "${DB_HOST:?Set DB_HOST}"
: "${DB_USER:?Set DB_USER}"
: "${DB_PASSWORD:?Set DB_PASSWORD}"
: "${DB_NAME:?Set DB_NAME}"
: "${ADMIN_PASSWD:?Set ADMIN_PASSWD (Odoo master password)}"

CONF=/tmp/odoo.conf
DATA_DIR=/tmp/odoo-data
mkdir -p "$DATA_DIR"

cat > "$CONF" <<CONFIG
[options]
admin_passwd = ${ADMIN_PASSWD}
db_host = ${DB_HOST}
db_port = ${DB_PORT:-5432}
db_user = ${DB_USER}
db_password = ${DB_PASSWORD}
db_name = ${DB_NAME}
db_sslmode = ${DB_SSLMODE:-prefer}
dbfilter = ^${DB_NAME}\$
list_db = False
http_interface = 0.0.0.0
http_port = ${PORT:-10000}
proxy_mode = True
workers = 0
max_cron_threads = 1
addons_path = /opt/extra-addons
data_dir = ${DATA_DIR}
log_level = info
CONFIG

echo "Starting Odoo on port ${PORT:-10000} (database: ${DB_NAME})"
exec odoo -c "$CONF"
