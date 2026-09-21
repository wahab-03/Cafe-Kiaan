# Café Kiaan — New PC Setup

## Prerequisites
- Odoo 17 Community
- PostgreSQL 17
- Node.js 18.17+ (Node.js 20 LTS recommended)

## Start
1. Make sure PostgreSQL 17 is running.
2. If the Windows Odoo service `odoo-server-17.0` is running on port 8070, stop it from **Administrator PowerShell** with `Stop-Service odoo-server-17.0`.
3. Open an Administrator PowerShell in this project folder and run `START_ODOO.bat`.
4. Wait for Odoo at http://localhost:8070.
5. In a second terminal run `START_FRONTEND.bat`. The first run installs dependencies with `npm ci`.
6. Open http://localhost:3000.

The project uses Odoo 17 as its backend. The frontend talks to `/cafe-kiaan/api`, and the Odoo customization module is `cafe_kiaan_restaurant`.
