# crackers-E-commerce
# Crackers Platform (JavaScript stack)

Fireworks/crackers e-commerce, no payment gateway: customers pay by UPI/bank transfer,
upload a screenshot, staff verify by hand.

**Stack:** Node + Express (JavaScript) · MongoDB (Mongoose) · Redis + BullMQ · React (Vite) ·
React Native (Expo).

```
crackers-platform/
├── apps/
│   ├── api/          Express + Mongoose backend (JavaScript)
│   ├── admin/        React (Vite) — ops console + inventory + verify + campaigns
│   ├── storefront/   React (Vite) — customer shop
│   ├── crm/          React (Vite) — customers, statuses, campaigns
│   └── mobile/       React Native (Expo) — customer app
└── packages/
    └── api-client/   shared JS client used by the 3 web apps
```

## Run locally

Prereqs: Node 20+, Docker.

```bash
npm install                       # installs all JS workspaces

# 1) data stores (MongoDB + Redis)
docker compose up -d

# 2) backend
cp apps/api/.env.example apps/api/.env
npm run seed                      # admin user + default statuses + sample data
npm run dev:api                   # http://localhost:4000  (worker: npm run dev:worker)

# 3) web apps (each in its own terminal)
npm run dev:storefront            # http://localhost:5173
npm run dev:admin                 # http://localhost:5174  (login 9000000000 / ChangeMe@123)
npm run dev:crm                   # http://localhost:5175

# 4) mobile
cd apps/mobile && npm install && npm start   # Expo — scan QR with Expo Go
```

Web apps read `VITE_API_URL` (default `http://localhost:4000/api/v1`). The mobile app reads
`API_BASE_URL` (Android emulator uses `http://10.0.2.2:4000/api/v1`).

## Notes
- Backend is CommonJS; the React apps + client are ES modules; the mobile app is Expo/React Native.
- Validation uses zod; auth uses JWT + argon2 with refresh-token rotation; uploads go to S3/MinIO
  (env-gated — without keys, a placeholder URL is returned).
