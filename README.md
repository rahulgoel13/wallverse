# WALLVERSE

> Walls are no longer just walls.

An immersive 3D wallpaper e-commerce experience: a cinematic scroll-driven homepage built with
React Three Fiber and GSAP, a real-time **Room Studio** visualizer with independently selectable
walls, and a complete working store — catalogue, calculator, cart, coupons, guest checkout,
orders and a protected admin dashboard.

**WALLVERSE is a working brand name** with a clearly-labelled demonstration catalogue. Brand
identity, contact details and commerce defaults are centralized in [`src/lib/site.ts`](src/lib/site.ts).

---

## Quick start

```bash
npm install
cp .env.example .env     # set DATABASE_URL(+_UNPOOLED) and the admin credentials/secret
npm run setup            # generates textures, creates the tables, seeds the catalogue
npm run dev              # http://localhost:3000
```

The store uses **PostgreSQL**. Locally, point both `DATABASE_URL` and `DATABASE_URL_UNPOOLED` at
any Postgres — a local install (`postgresql://USER:PASSWORD@localhost:5432/wallverse`) or the
same Neon database production uses.

`npm run setup` regenerates the 28 SVG textures, pushes the Prisma schema and seeds 10
collections, 28 products, 4 journal essays and 2 demo coupons (`WELCOME10`, `FLAT500`). The seed
only fills an **empty** database, so it never overwrites prices or stock edited in the admin;
run `SEED_FORCE=1 npm run db:seed` to re-apply the demo catalogue on purpose.

## Deploying to Vercel

1. **Add a database:** in the Vercel project, open **Storage → Create Database → Neon
   (Postgres)** and connect it to the project. This sets `DATABASE_URL` and
   `DATABASE_URL_UNPOOLED` for every environment.
2. **Add the admin variables** under **Settings → Environment Variables**: `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (e.g. `openssl rand -hex 32`). Optionally the
   `RAZORPAY_*` keys.
3. **Redeploy.** The `vercel-build` script generates the Prisma client, pushes the schema,
   seeds the catalogue if the database is empty, then builds. The canonical domain is detected
   from Vercel automatically; set `NEXT_PUBLIC_SITE_URL` only for a custom domain.

`prisma db push` refuses changes that would lose data, so a redeploy can't silently drop
columns. Once the store holds real data, switch to `prisma migrate` for reviewed migrations.

### All scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve (does not touch the database schema) |
| `npm run vercel-build` | What Vercel runs: client generate, schema push, seed-if-empty, build |
| `npm run setup` | Textures + schema push + seed, in one step |
| `npm run textures` | Regenerate `public/textures/*.svg` deterministically |
| `npm run db:push` / `npm run db:seed` | Prisma schema push / seed only |
| `npm test` | Unit tests (calculator, pricing, order validation) |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |

## Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres connection used by the app |
| `DATABASE_URL_UNPOOLED` | Direct Postgres connection used for schema pushes (same value if you have no pooler) |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical domain override (Vercel's production domain is used by default) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for `/admin` |
| `ADMIN_SESSION_SECRET` | Long random string signing the admin session cookie |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional. Empty ⇒ the store runs in clearly-labelled **demo payment mode**; set both to enable the real Razorpay checkout + server-side signature verification |

Secrets live only in `.env` (git-ignored). Never put keys in frontend code.

## The experience

- **Chapter 01 — The Portal.** A floating architectural room in 3D space; pointer parallax;
  clickable floating product samples.
- **Chapter 02 — The Unrolling Wall.** Scroll-scrubbed: a roll travels down a blank wall,
  papering it strip-physically.
- **Chapter 03 — The Design Corridor.** The camera travels through five textured chambers, one
  per collection, each linking to its real collection page.
- **Chapter 04 — The Wallpaper Takeover.** Pick a floating sample → its texture floods the
  viewport, a room appears wearing it, and the design "follows you" (header chip, Room Studio
  preselection) with a live buy panel.
- **Chapter 05 — The Transformation Gallery.** Drag-divided before/after rooms (identical
  geometry, only the wall changes).
- **Chapter 06 — The Gallery Floor.** Editorial commerce: featured design, new arrivals,
  bestsellers, the ten-collection index.

Every 3D moment has a static fallback (no WebGL, `prefers-reduced-motion`, context loss) and the
shopping journey never depends on WebGL.

## Room Studio (`/room-studio`)

Three room presets (living / bedroom / dining), four independently selectable walls, the full
design archive with per-wall pattern-scale control, lighting presets, paint swatches, camera
views, save (localStorage), share (URL), add-to-cart and a roll-calculator hand-off. Room photos
are kept on-device and shown side-by-side — the UI is explicit that photos are *not*
perspective-mapped.

## Store

`/shop` (search + filters + sort + pagination) · `/collections/[slug]` · `/product/[slug]`
(specs, repeat preview, A4 sample ordering, in-situ preview, embedded calculator, related +
recently viewed) · `/calculator` (strip-count method with stated assumptions) · `/cart`
(persistent, coupons) · `/checkout` (guest, zod-validated, INR, demo / Razorpay / COD) ·
`/order-confirmation/[id]` · `/wishlist` · `/search` · journal, about, contact, installation,
shipping/returns, privacy, terms, account.

**Pricing is always recomputed server-side** from the database at order creation; demo orders are
labelled as demonstrations everywhere they appear.

## Admin (`/admin`)

Cookie-session login (HMAC-signed, credentials from `.env`). Overview, product CRUD (products
with order history are retired, not deleted), collection CRUD, order status management, customers,
enquiry inbox, coupon management, and live commerce settings (shipping flat rate, free-shipping
threshold, GST display rate) stored in the database.

## Architecture notes

- **One texture system.** Every design is a deterministic, seamless 1024×1024 SVG generated by
  [`scripts/generate-textures.mjs`](scripts/generate-textures.mjs). The same asset drives 2D
  thumbnails (CSS tiles), SVG room illustrations (`<pattern>`), and 3D materials
  (`THREE.TextureLoader` with repeat wrapping + physical repeat arithmetic in
  [`three-utils.ts`](src/components/three/three-utils.ts)).
- **Stack:** Next.js 16 (App Router, server actions), TypeScript strict, Tailwind v4 theme
  tokens, React Three Fiber + drei, GSAP ScrollTrigger + Lenis, Zustand (persisted cart/wishlist/
  active design), react-hook-form + zod, Prisma + PostgreSQL.
- **Quality tiers:** phone/coarse-pointer devices get reduced geometry counts, capped DPR and no
  shadow maps; scenes mount lazily near the viewport and textures are cached/disposed.

## Known limitations (honest list)

- Payments: without Razorpay credentials, orders are demo/COD only — by design, clearly labelled.
- The catalogue is demonstration data, not verified seller inventory.
- Room photo upload is a side-by-side reference, not perspective mapping.
- No customer accounts (guest checkout only); `/account` explains this.

---

Built as a one-shot implementation. Run `npm test` for the pricing/calculator/validation suites.
