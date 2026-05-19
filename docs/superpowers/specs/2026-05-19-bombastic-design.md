# Bombastic — Streetwear Storefront (v1)

**Date:** 2026-05-19
**Owner:** anonymoushacker8377@gmail.com
**Status:** Design approved, ready for implementation planning

---

## Overview

Bombastic is a custom-coded direct-to-consumer streetwear storefront for an India-based brand starting with t-shirts. v1 must support real online purchases (Razorpay), be fast and aesthetically distinctive, and run at near-zero monthly cost. The codebase is structured so each "simple v1" choice has a clear upgrade path when the brand grows.

## Goals

- Sell t-shirts online with real checkout (UPI / cards / netbanking / wallets via Razorpay).
- Ship a visually distinctive site that competes on aesthetic with established streetwear brands.
- Keep monthly fixed cost at ~₹0 (hosting, DB) + per-transaction Razorpay fees + domain.
- Provide a foundation that can scale to more SKUs, customer accounts, and a real admin without a rewrite.

## Non-goals (v1)

- Customer accounts / login / order history.
- Wishlist, product reviews, recommendations.
- Discount codes, gift cards, store credit.
- Multi-currency or international shipping logic.
- Admin dashboard / CMS — products are edited in code for v1.
- Real-time / atomic inventory tracking — manual stock decrement is acceptable at launch volume.
- Lookbook / blog / editorial content as distinct sections.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | SSR for SEO, file-based routing, mature, free to host |
| Styling | Tailwind CSS | Fast iteration, tokenized theme for dark/light surfaces |
| Payments | Razorpay (Standard Checkout) | India-native, supports UPI/cards/netbanking, individual proprietor accounts allowed |
| Transactional email | Resend | 100 emails/day free, simple SDK |
| Hosting | Vercel (free tier) | Zero-config Next.js, edge CDN, free TLS |
| Domain | Custom (`bombastic.in` or similar) | Bought by owner, ~₹800/yr |
| Database (v1) | None — typed product file in repo | YAGNI; Razorpay dashboard is source of truth for orders |
| Analytics (v1) | None | Add Plausible later when there's traffic to read |

## Brand & visual system

### Surfaces

The site uses two distinct visual modes:

- **Dark surface** — homepage, about, shop grid. Communicates brand and drop energy.
- **Light surface** — product detail, cart, checkout, order confirmation. Makes garments the visual hero.

### Tokens

| Token | Dark | Light |
|---|---|---|
| `bg` | `#0a0a0a` | `#f3f1ec` |
| `text` | `#ececec` | `#0a0a0a` |
| `text-muted` | `#888` | `#666` |
| `accent` | `#ff3b2f` | `#ff3b2f` (used very sparingly) |

Accent is reserved for: live-drop status indicators, cart count badge, primary CTAs in select contexts. Not decoration.

### Typography

- **Display:** Inter (Google Fonts) at heavy weights for wordmark and large headlines. May be swapped for a paid display face (e.g., GT America, ABC Diatype) post-launch.
- **Body:** Inter, 14–16px, tight line-height.
- **Technical labels:** JetBrains Mono — used for drop numbers, version tags, status indicators, and small price/SKU labels. This is the load-bearing "underground" element in the aesthetic.

### Brand mark

- Primary wordmark: `Bombastic®` — clean, used in nav, footer, light surfaces.
- Hero treatment on dark surfaces: `BOMB/ASTIC_` — uppercase, heavy weight, terminal-style underscore as accent.
- No logo icon for v1. Pure typography keeps cost down and avoids locking in a mark before the brand has identity.

### Motion

Restrained. Subtle fade-up-on-scroll for hero text and product cards. No carousel auto-play. No popups. No marquee. The typography and spacing carry the energy.

### Placeholder imagery (pre-shoot)

Until real product photography exists, product images use neutral textured grey placeholders with the product name overlaid in JetBrains Mono. The product page layout is designed so real photos will instantly elevate the page when swapped in.

## Pages

### Public

| Route | Surface | Purpose |
|---|---|---|
| `/` | Dark | Hero (brand mark + current drop status), 2–3 featured tees, brand statement, CTA to shop |
| `/shop` | Dark | Grid of all products in the current drop. Sold-out items remain visible but greyed |
| `/shop/[slug]` | Light | Single product: images, size selector, price, description, materials, sizing chart, add-to-cart |
| `/cart` | Light | Line items, qty edit, remove, totals, "checkout" CTA |
| `/checkout` | Light | Shipping address form → Razorpay modal → success redirect |
| `/orders/[razorpayOrderId]` | Light | Order confirmation screen post-payment |
| `/about` | Dark | Brand story, origin, contact line |
| `/contact` | Light | Email + Instagram link + short FAQ (shipping / returns / sizing) |

### Policy pages (required for Razorpay verification and customer trust)

| Route | Purpose |
|---|---|
| `/policies/shipping` | Shipping timelines, costs, areas covered |
| `/policies/returns` | Return / exchange terms |
| `/policies/privacy` | Privacy policy |
| `/policies/terms` | Terms of service |

## Data model

Products live in a typed file at `src/data/products.ts`. Adding a product is a one-file edit plus image drop into `/public/products/`.

```ts
type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

type Product = {
  slug: string;            // URL-safe id, e.g. "static-tee-black"
  name: string;            // Display name
  priceInr: number;        // Whole rupees, integer
  description: string;     // Paragraph copy for product page
  materials: string;       // e.g. "240gsm heavyweight cotton, screen-printed"
  images: string[];        // Paths under /public/products/
  sizes: { size: ProductSize; stock: number }[];
  dropId: string;          // e.g. "drop-01"
  status: 'live' | 'sold_out' | 'archived';
};
```

The product file is the canonical source of truth for price and availability during checkout. Client-supplied prices are never trusted.

## Cart

- State held in React Context, persisted to `localStorage`.
- Cart entries: `{ slug, size, qty }` — minimum needed; everything else (price, name, image) is looked up from `products.ts` at render time, so cart contents stay consistent if a product is updated.
- No server-side cart in v1.

## Checkout flow

1. User submits shipping form (name, phone, email, address line 1/2, city, state, pincode).
2. Frontend posts cart + shipping to `POST /api/checkout`.
3. Server-side: validates stock against `products.ts`, recomputes total authoritatively, generates a friendly receipt id (`BMB-` + base36 timestamp), creates a Razorpay order via the Razorpay Orders API (passing cart + shipping address + receipt id in `notes`), returns `{ razorpayOrderId, amount, currency, receiptId }`.
4. Frontend opens the Razorpay Standard Checkout modal with the returned order id.
5. User completes payment in the modal.
6. **Server-side confirmation (authoritative):** Razorpay calls `POST /api/webhooks/razorpay`. We verify the HMAC signature, mark the order as paid in memory/log, and trigger the order-confirmation email (to customer + brand owner).
7. **Client-side fallback:** Razorpay's `handler` callback returns success to the browser; we call `POST /api/checkout/verify` which independently verifies the payment signature and renders the confirmation page. This shields the UX from webhook delivery delays.
8. Browser redirects to `/orders/[razorpayOrderId]` which shows the confirmation screen.

### Order persistence (v1)

- Razorpay is the source of truth for orders and payments. We do not maintain our own database in v1.
- When `/api/checkout` creates the Razorpay order, the cart, shipping address, and a generated human-friendly receipt id (e.g. `BMB-` + base36 timestamp) are written into Razorpay's `notes` field and the `receipt` field. Razorpay stores up to 15 notes per order, which is sufficient.
- `/orders/[razorpayOrderId]` is the confirmation page. Server-side, it fetches the order from Razorpay's API by id, reads the `notes` to render line items + shipping summary, and confirms payment status. URL uses the Razorpay order id so it's unguessable and self-contained.
- The order-confirmation email (to customer + brand owner) is the operational notification — it contains everything needed to ship: customer name, address, phone, line items, sizes, receipt id, Razorpay payment id, link to `/orders/[razorpayOrderId]`.

### Stock handling

- Stock lives in `products.ts` and is decremented manually after each order ships. Workflow: owner edits the stock count, commits, pushes — Vercel auto-deploys the change live within ~30 seconds.
- The `/api/checkout` endpoint re-reads `products.ts` at request time and rejects orders that would oversell, providing first-line protection.
- Race-condition window (two buyers, last item, same minute) is acceptable at launch volume. If it happens, owner refunds one customer via the Razorpay dashboard. This is documented in the runbook delivered with the site.

## Error handling

| Failure | Behavior |
|---|---|
| Razorpay modal closed / payment fails | Cart preserved; inline message "payment didn't go through, try again." No redirect. |
| Razorpay webhook signature invalid | Reject with 400, log structured error including request id. Never trust unsigned webhooks. |
| Stock changed between cart and checkout submit | `/api/checkout` returns 409 with the conflicting `{ slug, size }`. Cart page surfaces "this size sold out — remove it to continue." |
| Confirmation email fails to send | Order still considered complete (Razorpay is source of truth). Log the failure. Owner can manually re-send from the Razorpay dashboard / email tool. |
| Webhook delivery delayed | Client-side `/api/checkout/verify` independently confirms the payment so the user reaches `/orders/[razorpayOrderId]` immediately. Webhook eventually arrives and is idempotent — receiving it twice for the same payment is a no-op. |
| Invalid shipping form field | Client-side validation first; server-side validation on `/api/checkout` re-validates and returns 400 with field-level errors. |

## Testing

- **Unit:** cart reducer (add / remove / update qty / total computation), pincode/phone validation, order id generator, image path normalization.
- **Unit (security-critical):** server-side total recomputation in `/api/checkout` — verify a tampered client price is ignored. Webhook signature verifier — verify a forged or replayed payload is rejected.
- **Integration:** full checkout happy path against Razorpay test mode (test card numbers). Stock conflict path. Webhook idempotency (same payload twice → one email).
- **Manual launch checklist:** real test purchase in Razorpay test mode, switch to live keys, real test purchase with own card for ₹1 product (refunded), confirmation email received by customer + owner, mobile checkout flow on real device.

## Upgrade paths (when growth justifies)

| When | Change |
|---|---|
| 30+ SKUs or owner wants self-service product editing | Move products from file → Supabase, add minimal admin page |
| Customers ask for order history / saved addresses | Add NextAuth with email magic links |
| Stock race conditions become a real problem | Move stock to DB with atomic decrements / row locks |
| Traffic exists worth analyzing | Add Plausible (privacy-friendly, one script tag) |
| Going international | Add country-aware shipping zones, multi-currency display |
| Big hyped drops | Add countdown / waitlist / virtual queue |

Each upgrade replaces a single layer; the surrounding code is structured to absorb the swap without a rewrite.

## Open questions / decisions deferred

- **Domain name** — owner to register. Suggest `.in` for India trust signal.
- **Razorpay account type** — proprietorship setup, KYC documents.
- **Real product photography** — to be shot after first sample run; site is designed to swap placeholders for real photos with no layout changes.
- **Shipping carrier integration** — manual label printing at launch; consider Shippo / Shiprocket integration when order volume warrants it.
