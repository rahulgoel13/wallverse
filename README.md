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
npm run dev              # http://localhost:3000 — no database or .env needed
```

## Two data modes

The store runs in one of two modes, chosen by the `DATA_SOURCE` variable.

**Static (default — no database).** The catalogue, collections, journal and coupons are read
straight from `src/data/`. Every page, the 3D experiences, the Room Studio, search, filters,
the calculator, cart, wishlist and coupons work exactly as they do with a database. The things
that would need to *store* data degrade honestly:

| Feature | Without a database |
| --- | --- |
| Checkout | Clearly-labelled demo only. Prices and coupons are still verified on the server; the order is kept in the visitor's browser for its confirmation page and is **not** sent to the studio. |
| Contact form | Validates, then opens the visitor's email app with the enquiry ready to send to `site.email` (set your real address in `src/lib/site.ts`). |
| Admin (`/admin`) | Off — the page explains that it needs a database. |

**Database (`DATA_SOURCE=database`).** Everything is read from and written to PostgreSQL via
Prisma: real orders, the enquiry inbox, admin CRUD, cash-on-delivery and optional Razorpay. Set
`DATABASE_URL` and `DATABASE_URL_UNPOOLED` (Neon's Vercel integration sets both), plus the
admin variables, then run `npm run setup` to create the tables and seed the catalogue. The seed
only fills an **empty** database, so it never overwrites prices or stock edited in the admin;
`SEED_FORCE=1 npm run db:seed` re-applies the demo catalogue on purpose.

## Deploying to Vercel

**Static mode needs no configuration:** import the repository and deploy. The `vercel-build`
script generates the Prisma client and builds; it only touches a database when
`DATA_SOURCE=database` is set, so leftover database variables are ignored. The canonical domain
is detected from Vercel automatically; set `NEXT_PUBLIC_SITE_URL` only for a custom domain.

To switch on database mode later:

1. In the Vercel project, open **Storage → Create Database → Neon (Postgres)** and connect it.
2. Under **Settings → Environment Variables**, add `DATA_SOURCE=database`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (e.g. `openssl rand -hex 32`); optionally the
   `RAZORPAY_*` keys.
3. Redeploy. The build pushes the schema and seeds the empty database before building.

`prisma db push` refuses changes that would lose data, so a redeploy can't silently drop
columns. Once the store holds real data, switch to `prisma migrate` for reviewed migrations.

### All scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve (does not touch the database schema) |
| `npm run vercel-build` | What Vercel runs: client generate, then (database mode only) schema push + seed-if-empty, then build |
| `npm run setup` | Textures, then (database mode only) schema push + seed |
| `npm run textures` | Regenerate `public/textures/*.svg` deterministically |
| `npm run db:push` / `npm run db:seed` | Prisma schema push / seed only |
| `npm test` | Unit tests (calculator, pricing, order validation, static catalogue) |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |

## Environment (`.env`)

All variables are optional in static mode.

| Variable | Purpose |
| --- | --- |
| `DATA_SOURCE` | `database` to use PostgreSQL; anything else (or unset) runs static mode |
| `DATABASE_URL` | Database mode: pooled Postgres connection used by the app |
| `DATABASE_URL_UNPOOLED` | Database mode: direct connection used for schema pushes (same value if you have no pooler) |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical domain override (Vercel's production domain is used by default) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Database mode: credentials for `/admin` |
| `ADMIN_SESSION_SECRET` | Database mode: long random string signing the admin session cookie |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Database mode, optional. Empty ⇒ clearly-labelled **demo payment mode**; set both to enable the real Razorpay checkout + server-side signature verification |

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

Database mode only. Cookie-session login (HMAC-signed, credentials from `.env`). Overview, product CRUD (products
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

- Static mode (the default) stores nothing: demo orders live only in the visitor's browser,
  enquiries go out by email, and the admin is off. Database mode lifts all three.
- Payments: without Razorpay credentials, orders are demo/COD only — by design, clearly labelled.
- The catalogue is demonstration data, not verified seller inventory.
- Room photo upload is a side-by-side reference, not perspective mapping.
- No customer accounts (guest checkout only); `/account` explains this.

---

Built as a one-shot implementation. Run `npm test` for the pricing/calculator/validation suites.
