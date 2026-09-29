# Sivakumar Crackers — Deployment Guide (native, no Docker)

One script does the whole deploy on a **fresh Ubuntu VPS**: installs Node, MongoDB, Redis, and nginx; builds the storefront and admin; runs the API as a service that **starts on boot**; configures nginx; and gets an HTTPS certificate.

You run **one command** and it's live:
```bash
sudo bash deploy/deploy.sh
```

The same command is also how you **deploy updates** later (it's safe to re-run).

---

## What you need first

- A **fresh Ubuntu 22.04 or 24.04** VPS (2 GB RAM minimum, 4 GB comfortable) and its **public IP**.
- A **domain**, with DNS pointing at that IP (below).
- The **project zip**.

---

## Step 1 — Domain (Cloudflare) + DNS

1. Buy the domain (Cloudflare → **Domain Registration → Register Domains**), verify the ICANN email, enable 2-factor on the account.
2. Cloudflare → **DNS → Records**, add four **A** records to your server's IP, all **grey cloud (DNS only)** for now:

   | Type | Name | Content |
   |---|---|---|
   | A | `@` | your.server.ip |
   | A | `www` | your.server.ip |
   | A | `admin` | your.server.ip |
   | A | `api` | your.server.ip |

   Grey cloud makes the certificate step work first time; you'll switch to orange in Step 5.

> Cloudflare sells `.com` and most common TLDs. If you want a `.in`, buy it from an Indian registrar and use its (or Cloudflare's) DNS — the four records are the same.

---

## Step 2 — Put the code on the server

From your computer:
```bash
scp crackers-platform-js.zip root@YOUR_SERVER_IP:/root/
```
On the server:
```bash
ssh root@YOUR_SERVER_IP
cd /root && unzip crackers-platform-js.zip && cd crackers-js
```

---

## Step 3 — Fill in your settings

```bash
cp apps/api/.env.native.example apps/api/.env
nano apps/api/.env
```

Set these (the file has notes next to each):

- `DOMAIN` — your domain, e.g. `sivakumarcrackers.com`
- `CERTBOT_EMAIL` — your email (for the SSL cert)
- `MONGO_PASSWORD` and the **same** password inside `MONGODB_URI` — pick a strong one
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — two different random strings:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `STORE_UPI_ID`, `SUPPORT_PHONE` — your real UPI ID and WhatsApp number
- `VITE_API_URL` — leave as `https://api.<yourdomain>/api/v1` (must end in `/api/v1`)

Leave the `S3_*` values **blank** — images then save on the server's disk (in `UPLOADS_DIR`) and are served at `https://api.<yourdomain>/uploads/...`.

Save/exit nano: **Ctrl+O**, Enter, **Ctrl+X**.

---

## Step 4 — Run the deploy 🚀

```bash
sudo bash deploy/deploy.sh
```

It prints progress through 9 steps (packages → Mongo user/auth → deps → build → publish → API service → seed → nginx → SSL). First run takes several minutes (building the apps + installing MongoDB).

When it finishes it prints your URLs. Use the admin login configured through
`ADMIN_MOBILE` and `ADMIN_PASSWORD` before running the seed.

> If the SSL step warns that certbot failed, it's almost always because DNS hasn't finished pointing at the server yet. Wait a few minutes and run the exact command it prints (`certbot --nginx -d ... --redirect`).

---

## Step 5 — Cloudflare on, and log in

1. Cloudflare → DNS → turn each record's **grey cloud → orange** (Proxied).
2. Cloudflare → **SSL/TLS → Overview → set mode to `Full (strict)`**, then **Caching → Purge Everything**.
   > If you ever see **ERR_TOO_MANY_REDIRECTS**, it's because SSL mode is on **Flexible** — set it to **Full (strict)**.
3. Open `https://admin.sivakumarcrackers.com`, log in, and **immediately change the admin password**. Upload your **store logo** (Settings), add a product with a photo, and place a test order.

You're live. 🎆

---

## Deploying updates

Upload the new zip, unzip over the folder, and run the same command:
```bash
cd /root && unzip -o crackers-platform-js.zip && cd crackers-js
sudo bash deploy/deploy.sh
```
It rebuilds the frontends, restarts the API, and reloads nginx. It won't wipe your database or uploaded images.

> If you change `VITE_API_URL`, the script rebuilds the web apps with it automatically.

---

## Running the platform

The API runs as a systemd service and **restarts on crash and on reboot**:
```bash
systemctl status crackers-api      # is it running?
systemctl restart crackers-api     # restart it
journalctl -u crackers-api -f      # live logs
```
MongoDB and Redis also start on boot (`systemctl status mongod` / `redis-server`).

---

## Backups & renewal

**Database backup** (run regularly, then copy the file off the server):
```bash
mongodump --uri="mongodb://crackeradmin:YOUR_DB_PASS@127.0.0.1:27017/crackers?authSource=admin" \
  --archive=/root/backup-$(date +%F).gz --gzip
```

**HTTPS renewal** is automatic — the certbot package installs a systemd timer, and the deploy script adds a hook that reloads nginx after each renewal. Check with:
```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` on the API | API isn't running → `journalctl -u crackers-api -e`. Usually a wrong `MONGODB_URI` password (must match `MONGO_PASSWORD`). |
| API log: `ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't up → `systemctl status mongod`; `systemctl restart mongod`. |
| API log: `Authentication failed` | Wrong Mongo password, or auth was enabled before the user existed → check `MONGO_USER`/`MONGO_PASSWORD`, or recreate the user (below). |
| `certbot` failed | DNS not pointing at the server yet → wait, then `certbot --nginx -d DOMAIN -d www.DOMAIN -d admin.DOMAIN -d api.DOMAIN --redirect`. |
| `ERR_TOO_MANY_REDIRECTS` | Cloudflare SSL is **Flexible** → set **Full (strict)** + Purge Everything. |
| Product images / logo broken | Confirm `S3_*` are blank and re-run the script; open one image URL directly to see if it 404s. |
| Admin "network error" on login | `CORS_ORIGINS` must include the admin URL, and `VITE_API_URL` must be right → fix `.env`, re-run the script (rebuilds the web apps). |

**Recreate the Mongo user manually** (if auth got enabled before the user was created):
```bash
sudo sed -i '/authorization: enabled/d' /etc/mongod.conf   # temporarily disable auth
sudo systemctl restart mongod
mongosh admin --eval "db.createUser({user:'crackeradmin',pwd:'YOUR_DB_PASS',roles:[{role:'root',db:'admin'}]})"
sudo bash deploy/deploy.sh    # re-enables auth and continues
```

---

## Go-live checklist

- [ ] `apps/api/.env` filled — `DOMAIN`, matching Mongo password, JWT secrets, UPI/phone, `VITE_API_URL` ends `/api/v1`, `S3_*` blank
- [ ] DNS (root, www, admin, api) points at the server
- [ ] `sudo bash deploy/deploy.sh` finished; `systemctl status crackers-api` = active
- [ ] `https://api.<domain>/api/v1/settings/public` returns JSON
- [ ] Default admin password changed; logo uploaded; test product photo shows; test order completes
- [ ] Cloudflare orange + SSL **Full (strict)**
- [ ] First database backup taken
