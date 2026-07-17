# Sivakumar Crackers — Deploy Online From Scratch

A complete, beginner-friendly, step-by-step guide to buy a domain on **Cloudflare** and put your platform **live on the internet**. No prior server experience needed — copy each command exactly.

Work through the parts **in order**. Set aside about **1–2 hours** the first time.

---

## 0. What you're putting online, and what it costs

**Your platform has 3 web pieces** (the mobile app is separate — see Part 12):

| Piece | Lives at (example) | What it is |
|---|---|---|
| Storefront (customers) | `sivakumarcrackers.com` | The shop |
| Admin panel (you) | `admin.sivakumarcrackers.com` | Orders, products, customers, support |
| API (the brain) | `api.sivakumarcrackers.com` | Backend + database |

Everything runs in **Docker containers** on **one rented server (a "VPS")**. You point your **domain** at that server, add **HTTPS (the padlock)**, and start it with one command.

**Monthly cost (rough):**

| Item | Cost |
|---|---|
| Domain (Cloudflare, `.com`) | ~₹850–1,000 / **year** (at-cost, no markup) |
| Server / VPS (2–4 GB RAM) | ~₹350–900 / **month** |
| HTTPS certificate (Let's Encrypt) | **Free** |
| Cloudflare plan | **Free** |

You'll need: a **credit/debit card**, an **email address**, and the **project zip** you already have.

> A quick note on the domain extension: Cloudflare Registrar sells most common extensions (like **.com**, **.net**, **.shop**, **.store**) at cost. It may **not** sell **.in** directly. If you specifically want a `.in` domain, buy it from an Indian registrar (BigRock, GoDaddy, etc.) and just use Cloudflare for DNS — the rest of this guide is identical. To keep things simplest, this guide uses **`sivakumarcrackers.com`** as the example. **Replace it with your real domain everywhere it appears.**

---

## PART 1 — Buy your domain on Cloudflare

1. Go to **https://dash.cloudflare.com/sign-up**. Enter your email + a strong password → **Create Account**.
2. Open the verification email from Cloudflare and click the link.
3. In the dashboard left menu, click **Domain Registration → Register Domains**.
4. Type the name you want (e.g. `sivakumarcrackers`) and press **Search**.
5. Pick an available name from the list and click **Purchase**.
6. Choose the **number of years** (1 is fine), fill in your **contact details**, add your **card**, and confirm.
7. **Important:** Cloudflare/ICANN will email you to **verify your registrant email**. Click that link within a few days, or your domain gets temporarily parked.

Done — the domain is yours and **already uses Cloudflare DNS automatically** (no extra setup). You'll add DNS records in Part 4.

> Turn on **two-factor authentication** for your Cloudflare account now (My Profile → Authentication). This account controls your whole domain — protect it.

---

## PART 2 — Rent a server (VPS)

Any provider works. Good, simple options: **DigitalOcean**, **Hetzner**, **Vultr**, **Linode**, or **AWS Lightsail**. For customers in India, pick a **Bangalore/Mumbai** or Singapore region (Cloudflare speeds up the rest).

**Create the server:**

1. Sign up with a provider and click **Create Droplet / Server / Instance**.
2. **Image / OS:** choose **Ubuntu 24.04 LTS**.
3. **Size:** pick at least **2 GB RAM** (4 GB is comfortable — you're running a database + several containers). This is the main thing that matters.
4. **Region:** closest to your customers.
5. **Authentication:** choose **SSH key** if you know how, otherwise **Password** (simpler to start).
6. Create it. After a minute you'll get a **public IP address**, e.g. `203.0.113.45`. **Write it down** — you'll use it a lot.

**Log into the server** from your computer's terminal (Mac/Linux: Terminal; Windows: PowerShell or [PuTTY](https://www.putty.org/)):

```bash
ssh root@203.0.113.45
```

Type `yes` if asked, then the password. You're now "inside" the server.

---

## PART 3 — First-time server setup

Run these **on the server** (the SSH session), one block at a time.

**3.1 — Update the system:**
```bash
apt update && apt upgrade -y
```

**3.2 — Install Docker + Docker Compose:**
```bash
curl -fsSL https://get.docker.com | sh
docker compose version   # should print a version number
```

**3.3 — Turn on the firewall (allow only SSH + web):**
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
```

**3.4 — Install a few tools you'll use:**
```bash
apt install -y unzip certbot
```

That's the whole server prep.

---

## PART 4 — Point your domain at the server (Cloudflare DNS)

In the Cloudflare dashboard, click your domain, then **DNS → Records → Add record**. Create these **4 records** (swap in **your** server IP and domain):

| Type | Name | Content (IP) | Proxy status |
|---|---|---|---|
| A | `@` | `203.0.113.45` | **DNS only** (grey cloud) |
| A | `www` | `203.0.113.45` | **DNS only** (grey cloud) |
| A | `admin` | `203.0.113.45` | **DNS only** (grey cloud) |
| A | `api` | `203.0.113.45` | **DNS only** (grey cloud) |

> **Start with the grey cloud ("DNS only").** It makes getting the HTTPS certificate in Part 7 painless. You'll switch on the **orange cloud** (Cloudflare's protection/CDN) at the very end in Part 11.

DNS can take a few minutes to spread. Check it's pointing correctly:
```bash
ping -c1 sivakumarcrackers.com   # should show your server IP
```

---

## PART 5 — Put the code on the server

**5.1 — Get the project onto the server.** Easiest way: upload the zip. From **your own computer** (not the server), in a new terminal:
```bash
scp crackers-platform-js.zip root@203.0.113.45:/root/
```

**5.2 — Back on the server**, unzip it:
```bash
cd /root
unzip crackers-platform-js.zip
cd crackers-js
```

You should see `docker-compose.prod.yml`, `apps/`, `nginx/`, etc. (`ls` to confirm).

---

## PART 6 — Fill in your settings (the `.env` file)

This one file holds every password and secret. Copy the template and edit it:

```bash
cp apps/api/.env.production.example .env
nano .env
```

`nano` is a simple editor. Change every `CHANGE_ME` and every `yourstore.in` to your real domain. Here's exactly what to set (👉 = you must change):

```ini
NODE_ENV=production
PORT=4000
API_URL=https://api.sivakumarcrackers.com                        👈
CORS_ORIGINS=https://sivakumarcrackers.com,https://admin.sivakumarcrackers.com   👈

# Database — pick a strong username/password and use the SAME ones in MONGO_USER/PASSWORD below
MONGODB_URI=mongodb://ckadmin:StrongDbPass123@mongo:27017/crackers?authSource=admin   👈

# Redis — pick a password, reuse it in REDIS_PASSWORD below
REDIS_URL=redis://:StrongRedisPass123@redis:6379                 👈

# Security keys — generate two DIFFERENT random strings (commands below)
JWT_ACCESS_SECRET=PASTE_RANDOM_HEX                               👈
JWT_REFRESH_SECRET=PASTE_A_DIFFERENT_RANDOM_HEX                  👈
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# Image storage — leave S3 blank to store images on the server's disk (simplest; a
# docker volume keeps them safe across restarts). You can move to MinIO/R2 later.
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
UPLOADS_DIR=/app/uploads

# Your shop
STORE_NAME=Sivakumar Crackers
STORE_UPI_ID=yourupi@okhdfc                                      👈  (your real UPI ID)
SUPPORT_PHONE=91XXXXXXXXXX                                       👈  (your WhatsApp/support number)
MIN_ORDER_AMOUNT=3500
PACK_TRANSPORT_PCT=5

# ===== container passwords (must match the ones above) =====
MONGO_USER=ckadmin                                              👈  (match MONGODB_URI)
MONGO_PASSWORD=StrongDbPass123                                  👈  (match MONGODB_URI)
REDIS_PASSWORD=StrongRedisPass123                               👈  (match REDIS_URL)
MINIO_ROOT_USER=notused
MINIO_ROOT_PASSWORD=notused
VITE_API_URL=https://api.sivakumarcrackers.com/api/v1           👈  (note the /api/v1)
```

**To generate the two JWT secrets**, run this twice and paste each result:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null \
  || docker run --rm node:20-alpine node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit nano: **Ctrl+O**, **Enter**, then **Ctrl+X**.

> **Two rules that trip people up:** (1) `VITE_API_URL` **must end in `/api/v1`**; `API_URL` must **not**. (2) The username/password inside `MONGODB_URI` must be **identical** to `MONGO_USER`/`MONGO_PASSWORD`.

---

## PART 7 — Get your HTTPS certificate (the padlock)

Your site needs a certificate so browsers show the padlock and don't warn customers. We'll get a **free Let's Encrypt** one. (Grey-cloud DNS from Part 4 makes this work first time.)

Run this on the server — **replace the domain** and put **all four names** in:
```bash
certbot certonly --standalone \
  -d sivakumarcrackers.com \
  -d www.sivakumarcrackers.com \
  -d admin.sivakumarcrackers.com \
  -d api.sivakumarcrackers.com \
  --agree-tos -m you@email.com --no-eff-email
```

If it says **"Congratulations"**, your certificates are saved at `/etc/letsencrypt/live/sivakumarcrackers.com/`. 

> If it fails, DNS probably hasn't finished pointing at your server yet (Part 4) or the firewall is blocking port 80 (Part 3.3). Wait a few minutes and retry.

---

## PART 8 — Put your domain into the nginx config

The web server config still says `yourstore.in`. Replace it with your domain in one command (swap in your real domain):
```bash
cd /root/crackers-js
sed -i 's/yourstore.in/sivakumarcrackers.com/g' nginx/edge.conf
```

Quick check that it looks right:
```bash
grep server_name nginx/edge.conf
```
You should see your domain on the storefront, `admin.` on admin, `api.` on api. 

---

## PART 9 — Launch everything 🚀

One command builds and starts all the containers (this takes a few minutes the first time):
```bash
cd /root/crackers-js
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Check they're all running:
```bash
docker compose -f docker-compose.prod.yml ps
```
You want to see `mongo`, `redis`, `minio`, `api`, `storefront`, `admin`, `nginx` all **Up**.

If one isn't up, read its logs (e.g. the API):
```bash
docker compose -f docker-compose.prod.yml logs api --tail=50
```

---

## PART 10 — Create your admin login & test

**10.1 — Seed the database** (creates your first admin user + sample data):
```bash
docker compose -f docker-compose.prod.yml exec api npm run seed
```
This creates an admin login: **mobile `9000000000`**, **password `ChangeMe@123`**.

**10.2 — Open your sites** in a browser:
- Storefront: `https://sivakumarcrackers.com`
- Admin: `https://admin.sivakumarcrackers.com`

**10.3 — Log into admin** with `9000000000` / `ChangeMe@123`.

**10.4 — 🔒 Change that admin password immediately.** It's public knowledge. (Create a new staff user or change the seeded one — never leave the default live.)

**10.5 — Quick smoke test:** add a product with a photo in admin → open the storefront → the product and its image should show → add to cart → the whole order flow should work.

---

## PART 11 — Turn on Cloudflare protection (final polish)

Now switch on Cloudflare's CDN + security:

1. Cloudflare dashboard → your domain → **DNS → Records**. Click the **grey cloud** next to each of the 4 records to make it **orange** (Proxied).
2. Go to **SSL/TLS → Overview** and set the mode to **Full (strict)**. (This keeps HTTPS encrypted all the way to your server, using the Let's Encrypt cert from Part 7.)
3. Optional niceties: **SSL/TLS → Edge Certificates → Always Use HTTPS = On**, and **Automatic HTTPS Rewrites = On**.

Your site is now faster and shielded by Cloudflare. Reload the pages to confirm they still work.

---

## PART 12 — The mobile app (separate from the website)

The Expo mobile app isn't hosted on your server — it's **built into installable apps** and published to the Play Store / App Store. That's a separate process (Expo's **EAS Build**). The only server-side thing that matters: point the app at your live API. In `apps/mobile/src/api.js`, set the API base URL to `https://api.sivakumarcrackers.com/api/v1`, then follow Expo's build/publish docs. You can do this later — the website is fully live without it.

---

## Keeping it running (maintenance)

**Back up your database** (do this regularly — it's your orders and customers):
```bash
docker compose -f docker-compose.prod.yml exec mongo \
  mongodump --username ckadmin --password StrongDbPass123 --authenticationDatabase admin \
  --db crackers --archive=/data/db/backup-$(date +%F).gz --gzip
docker compose -f docker-compose.prod.yml cp mongo:/data/db/backup-$(date +%F).gz ./
```
Then download the `.gz` file off the server (`scp` it to your computer, or upload to Google Drive).

**Renew the HTTPS certificate** (Let's Encrypt lasts 90 days). Set it to auto-renew:
```bash
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --deploy-hook 'docker compose -f /root/crackers-js/docker-compose.prod.yml restart nginx'") | crontab -
```

**Deploy an update** after you change code (upload the new zip, then):
```bash
cd /root/crackers-js
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

**See what's happening / logs:**
```bash
docker compose -f docker-compose.prod.yml logs -f api      # live API logs
docker compose -f docker-compose.prod.yml ps               # container status
docker compose -f docker-compose.prod.yml restart nginx    # restart one service
```

---

## Troubleshooting

| Symptom | Likely cause & fix |
|---|---|
| Browser: "site can't be reached" | DNS not pointing yet (Part 4), or firewall blocking 80/443 (Part 3.3). `docker compose ... ps` — is `nginx` Up? |
| Padlock warning / "not secure" | Certificate step (Part 7) didn't complete, or Cloudflare SSL mode isn't **Full (strict)** (Part 11.2). |
| `nginx` container keeps restarting | It can't find the cert files. Re-run Part 7, confirm `/etc/letsencrypt/live/<yourdomain>/` exists, then `docker compose ... restart nginx`. |
| Admin loads but **login fails / network error** | `CORS_ORIGINS` or `VITE_API_URL` wrong in `.env`. Fix, then **rebuild** (web URLs are baked at build): `docker compose ... up -d --build`. |
| Product **images don't show** (broken icon) | You're on an old build. This build already fixes it (cross-origin header on `/uploads`). Make sure the `api` container has the `apiuploads` volume and you rebuilt. |
| API container won't start | `docker compose ... logs api` — usually a wrong `MONGODB_URI` password (must match `MONGO_USER`/`MONGO_PASSWORD`). |
| Everything up but blank page | Hard-refresh (Ctrl+Shift+R). Still blank → check `docker compose ... logs storefront`. |

---

## One-page command reference

```bash
# connect
ssh root@YOUR_SERVER_IP

# deploy / update
cd /root/crackers-js
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# status & logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api

# first-time seed (admin: 9000000000 / ChangeMe@123 — CHANGE IT)
docker compose -f docker-compose.prod.yml exec api npm run seed

# HTTPS cert (first time)
certbot certonly --standalone -d DOMAIN -d www.DOMAIN -d admin.DOMAIN -d api.DOMAIN --agree-tos -m you@email.com
```

---

### Final checklist before you tell customers

- [ ] Storefront loads over **https://** with a padlock
- [ ] Admin loads at **admin.** and you can log in
- [ ] Default admin password **changed**
- [ ] A test product with a **photo shows** on the storefront
- [ ] A full test order goes through (add → location → pay screen → upload)
- [ ] Your real **UPI ID** and **support number** are set in `.env`
- [ ] Cloudflare proxy **orange**, SSL **Full (strict)**
- [ ] A **database backup** taken and downloaded
- [ ] Cert **auto-renew** cron added

You're live. 🎆
