# Codebase Guide (JS / Mongo stack)

## Architecture
React apps + React Native → **@crackers/api-client** (shared fetch client) → **Express API** →
**MongoDB (Mongoose)** + **Redis** (cache + BullMQ queue) + **S3/MinIO** (uploads). A **worker**
process drains the campaign queue.

Request path: `app.js` (helmet/cors/rate-limit) → module `*.routes.js` → `authenticate` /
`requireStaff` / `requirePermission` → `validate(zodSchema)` → `*.controller.js` →
`*.service.js` (logic + Mongoose) → `error.js`.

## apps/api (backend, CommonJS)
- `src/server.js` — boot: connect Mongo, start Express. `src/app.js` — middleware + mounts all routers under `/api/v1`.
- `src/config/env.js` — env loading. `src/lib/` — `db` (mongoose), `redis`, `jwt`, `otp`, `password`, `logger`.
- `src/middleware/` — `auth` (JWT + RBAC), `validate` (zod), `error`, `rateLimit`, `audit`.
- `src/utils/` — `apiError`, `asyncHandler`, `pricing` (MRP−discount), `pagination`, `ids`.
- `src/models/` — Mongoose schemas: `user`, `token` (refresh+otp), `catalog` (Category/Product),
  `order` (items/proofs/history embedded), `crm` (Customer/Status/Communication/FollowUp),
  `campaign`, `misc` (Review/AuditLog). Barrel: `models/index.js`.
- `src/modules/<m>/` — each has `*.schemas.js` (zod) · `*.service.js` · `*.controller.js` · `*.routes.js`:
  `auth`, `products` (catalog+categories+inventory), `orders` (manual-payment engine),
  `crm` (customers/statuses/import), `campaigns`, `analytics`, `uploads` (storage+notify+route).
- `src/queue/` — `connection`, `campaign.queue` (enqueue + worker dispatch), `worker.js` (entry).
- `scripts/seed.js` — admin user, default statuses, sample category/products.

## packages/api-client (shared, ESM)
- `src/client.js` — fetch wrapper, Bearer token, refresh-on-401, multipart `upload`/`postForm`.
- `src/browserTokenStore.js` — localStorage store. `src/index.js` — `createApi()` typed surface.

## apps/admin · storefront (React + Vite, ESM)
Each: `index.html`, `src/main.jsx`, `src/index.css` (design system), `src/lib/api.js`
(`createApi` + BrowserTokenStore), `src/lib/format.js`, `src/components/<Shell>.jsx`,
`src/components/ui.jsx` (`useAsync` + Loading/Error), `src/components/views/*.jsx` (one per screen).
- admin views: Overview, Verify, Orders (profit + tracking + editable bill), Inventory (cost price), Catalog, Customers (CRM: add/import/WhatsApp/location map), Statuses, Campaigns.
- storefront views: Catalog, Checkout (pay+upload), OrderPlaced; `lib/cart.jsx` (context).

## apps/mobile (React Native / Expo)
- `App.js` — navigation (tabs + stack). `src/api.js` — `createApi` + AsyncStorage token store.
- `src/state/` — `cart`, `auth` contexts. `src/components/ProductCard.js`.
- `src/screens/` — Catalog, Cart, Checkout (expo-image-picker upload), OrderPlaced, Login, Account.

## Key flows
- **Place + pay:** storefront Checkout → `orders.place` → `uploads.image` → `orders.uploadPayment` (status PAYMENT_UPLOADED).
- **Verify:** admin Verify → `orders.adminList(PAYMENT_UPLOADED)` → `orders.reviewPayment` (→ PAYMENT_APPROVED).
- **Fulfilment:** admin Orders → `orders.updateStatus` (guarded by ALLOWED_TRANSITIONS; CANCELLED restocks).
- **Campaign:** admin → `campaigns.create` → `campaigns.send` → worker dispatches via notify.
