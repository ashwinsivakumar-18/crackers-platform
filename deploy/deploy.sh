#!/usr/bin/env bash
# ============================================================================
#  Sivakumar Crackers — one-shot NATIVE deploy (no Docker)
#  Fresh Ubuntu 22.04 / 24.04 VPS. Run as root from the project root:
#
#      sudo bash deploy/deploy.sh
#
#  It installs Node + MongoDB + Redis + nginx, builds the apps, sets the API
#  to run on boot (systemd), configures nginx, and gets an HTTPS certificate.
#  Safe to re-run (idempotent) — use it for updates too.
#
#  Before running: copy apps/api/.env.native.example to apps/api/.env, fill it
#  in, and point your DNS (root, www, admin, api) at this server.
# ============================================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then echo "Run with sudo/root."; exit 1; fi

# --- locate project root (this script lives in <root>/deploy) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/apps/api/.env"

[ -f "$ENV_FILE" ] || { echo "ERROR: $ENV_FILE not found. Copy apps/api/.env.native.example to it and fill it in."; exit 1; }

# read a single value from the env file (handles spaces + surrounding quotes; no sourcing)
getenv() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"; }

DOMAIN="$(getenv DOMAIN)"
CERTBOT_EMAIL="$(getenv CERTBOT_EMAIL)"
MONGO_USER="$(getenv MONGO_USER)"
MONGO_PASSWORD="$(getenv MONGO_PASSWORD)"
VITE_API_URL="$(getenv VITE_API_URL)"
UPLOADS_DIR="$(getenv UPLOADS_DIR)"; UPLOADS_DIR="${UPLOADS_DIR:-/var/lib/crackers/uploads}"

[ -n "$DOMAIN" ] || { echo "ERROR: DOMAIN not set in $ENV_FILE"; exit 1; }
[ -n "$MONGO_USER" ] && [ -n "$MONGO_PASSWORD" ] || { echo "ERROR: MONGO_USER/MONGO_PASSWORD not set"; exit 1; }
[ -n "$CERTBOT_EMAIL" ] || CERTBOT_EMAIL="admin@$DOMAIN"

echo "================================================================"
echo "  Deploying Sivakumar Crackers (native) for: $DOMAIN"
echo "================================================================"

export DEBIAN_FRONTEND=noninteractive
. /etc/os-release
CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-jammy}}"

# ---------------------------------------------------------------- 1. packages
echo "==> [1/9] Installing system packages"
apt-get update -y
apt-get install -y curl gnupg ca-certificates ufw nginx

# Node.js 20 (only if missing/old)
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//;s/\..*//')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Redis
apt-get install -y redis-server
systemctl enable --now redis-server

# MongoDB 7.0 (only if missing)
if ! command -v mongod >/dev/null 2>&1; then
  curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
fi
systemctl enable --now mongod
sleep 3

# certbot
apt-get install -y certbot python3-certbot-nginx

# ---------------------------------------------------------- 2. mongo user/auth
echo "==> [2/9] Configuring MongoDB user + authentication"
if mongosh --quiet "mongodb://127.0.0.1:27017/admin" --eval "db.runCommand({ping:1})" >/dev/null 2>&1; then
  # reachable without auth → create the user (if missing) then turn auth on
  mongosh --quiet "mongodb://127.0.0.1:27017/admin" --eval \
    "if(!db.getUser('${MONGO_USER}')){db.createUser({user:'${MONGO_USER}',pwd:'${MONGO_PASSWORD}',roles:[{role:'root',db:'admin'}]});print('user created');}else{print('user exists');}"
  if ! grep -qE "^\s*authorization:\s*enabled" /etc/mongod.conf; then
    if grep -qE "^security:" /etc/mongod.conf; then
      sed -i '/^security:/a\  authorization: enabled' /etc/mongod.conf
    else
      printf "\nsecurity:\n  authorization: enabled\n" >> /etc/mongod.conf
    fi
    systemctl restart mongod
    sleep 3
  fi
else
  echo "    Mongo already requires auth — assuming user exists."
fi

# ------------------------------------------------------------------- 3. build
echo "==> [3/9] Installing dependencies (a few minutes)"
npm install --no-audit --no-fund
echo "==> [4/9] Building storefront + admin (VITE_API_URL=$VITE_API_URL)"
export VITE_API_URL
npm run build -w apps/storefront
npm run build -w apps/admin

# --------------------------------------------------------- 4. deploy frontends
echo "==> [5/9] Publishing static frontends"
mkdir -p /var/www/crackers-storefront /var/www/crackers-admin
rm -rf /var/www/crackers-storefront/* /var/www/crackers-admin/*
cp -r apps/storefront/dist/* /var/www/crackers-storefront/
cp -r apps/admin/dist/* /var/www/crackers-admin/

# uploads dir (persistent, outside the repo)
mkdir -p "$UPLOADS_DIR"

# ---------------------------------------------------------- 5. API on boot
echo "==> [6/9] Installing API service (systemd, starts on boot)"
cat > /etc/systemd/system/crackers-api.service <<UNIT
[Unit]
Description=Sivakumar Crackers API
After=network-online.target mongod.service redis-server.service
Wants=network-online.target mongod.service redis-server.service

[Service]
Type=simple
WorkingDirectory=$ROOT/apps/api
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable crackers-api
systemctl restart crackers-api
sleep 3

# ------------------------------------------------------------------- 6. seed
echo "==> [7/9] Seeding database (first run only; harmless if already seeded)"
npm run seed || echo "    seed skipped/failed (likely already seeded) — continuing"

# ------------------------------------------------------------------ 7. nginx
echo "==> [8/9] Configuring nginx"
cat > /etc/nginx/sites-available/crackers <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/html; }
    root /var/www/crackers-storefront;
    index index.html;
    location / { try_files \$uri /index.html; }
}
server {
    listen 80;
    server_name admin.${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/html; }
    root /var/www/crackers-admin;
    index index.html;
    location / { try_files \$uri /index.html; }
}
server {
    listen 80;
    server_name api.${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/html; }
    client_max_body_size 12m;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/crackers /etc/nginx/sites-enabled/crackers
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/html
nginx -t && systemctl reload nginx

# firewall
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80 >/dev/null 2>&1 || true
ufw allow 443 >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

# --------------------------------------------------------------------- 8. SSL
echo "==> [9/9] Requesting HTTPS certificate"
if certbot --nginx --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect \
     -d "$DOMAIN" -d "www.$DOMAIN" -d "admin.$DOMAIN" -d "api.$DOMAIN"; then
  echo "    HTTPS enabled."
else
  echo "    WARNING: certbot failed (usually DNS not pointing here yet)."
  echo "    Once DNS is set, re-run:  certbot --nginx -d $DOMAIN -d www.$DOMAIN -d admin.$DOMAIN -d api.$DOMAIN --redirect"
fi

# auto-renew is installed by the certbot package (systemd timer). Reload nginx on renew:
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo ""
echo "================================================================"
echo "  Done."
echo "    Storefront : https://$DOMAIN"
echo "    Admin      : https://admin.$DOMAIN   (login 9000000000 / ChangeMe@123 — CHANGE IT)"
echo "    API health : https://api.$DOMAIN/api/v1/settings/public"
echo ""
echo "  Manage the API:   systemctl status|restart|stop crackers-api"
echo "  API logs:         journalctl -u crackers-api -f"
echo "================================================================"
