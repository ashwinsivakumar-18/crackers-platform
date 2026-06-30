# Deploy Guide — JS/Mongo stack (fresh server → live HTTPS)

Plain-English steps. Replace **yourstore.in** with your domain. Docker keeps everything
running and restarts it on reboot.

## Need first
- Domain (e.g. yourstore.in), a VPS (Ubuntu 22.04+, 2–4 GB RAM), and its public IP.

## 1. DNS
Add A-records all pointing to your server IP: `@`, `www`, `api`, `admin`, `crm`.

## 2. Install Docker (and start on boot)
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable docker
```

## 3. Get the code
```bash
git clone <repo> crackers-platform && cd crackers-platform   # or unzip the zip
```

## 4. Settings
```bash
cp apps/api/.env.production.example .env
nano .env
```
Generate two secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (run twice).
Make MongoDB/Redis/MinIO passwords match across the URI and the compose variables (the file says which).

## 5. HTTPS certificate (one time)
```bash
sudo apt-get update && sudo apt-get install -y certbot
sudo certbot certonly --standalone -d yourstore.in -d www.yourstore.in -d admin.yourstore.in -d api.yourstore.in
```

## 6. Start everything (one command)
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps      # all "running"
```

## 7. Seed + secure
```bash
docker compose -f docker-compose.prod.yml exec api npm run seed
```
Open `https://admin.yourstore.in`, log in `9000000000 / ChangeMe@123`, change the password.

Live: storefront `https://yourstore.in`, admin `https://admin.yourstore.in`.

## Day-to-day
```bash
docker compose -f docker-compose.prod.yml logs -f api    # logs
docker compose -f docker-compose.prod.yml up -d --build  # after code changes
```
Restart on reboot is automatic (`restart: unless-stopped` + Docker enabled on boot).

## Soon after launch
- **MongoDB backups:** `docker compose -f docker-compose.prod.yml exec -T mongo mongodump --archive` (cron + copy off-server).
- **Cert renewal:** `sudo certbot renew --quiet && docker compose -f docker-compose.prod.yml restart nginx` (monthly cron).

## Mobile
`cd apps/mobile`, set the API URL, `npm install`, build with EAS / `expo build`, submit to the stores.
