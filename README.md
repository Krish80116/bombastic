# Bombastic

Streetwear storefront for the Bombastic brand. Built with Next.js + Razorpay.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real keys
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm test            # one-off
npm run test:watch  # watch mode
```

## Day-to-day owner workflow

### Adding a new product

1. Drop product photos into `public/products/`. Use sensible filenames like `dropname-color-1.jpg`.
2. Open `src/data/products.ts` and add a new entry to the `products` array.
3. Commit + push. Vercel auto-deploys in ~30 seconds.

### Decrementing stock after shipping an order

1. Open `src/data/products.ts`.
2. Find the matching `slug` and `size`, decrement the `stock` number.
3. Commit + push.

### Marking a product sold out

Change `status: 'live'` to `status: 'sold_out'` for that product.

### Switching from test to live Razorpay keys

In Vercel project settings → Environment Variables:

- Update `RAZORPAY_KEY_ID` to your `rzp_live_...` key id
- Update `RAZORPAY_KEY_SECRET` to your live key secret
- Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the live key id
- Update `RAZORPAY_WEBHOOK_SECRET` to the live webhook secret
- Redeploy

### Setting up the webhook in Razorpay

In the Razorpay dashboard:

1. Go to Webhooks → Add new webhook.
2. URL: `https://<yourdomain>/api/webhooks/razorpay`
3. Secret: paste a long random string. Save the same string as `RAZORPAY_WEBHOOK_SECRET` in Vercel.
4. Enable event: `payment.captured`.

## Launch checklist

- [ ] Real product photos shot and uploaded
- [ ] All product descriptions and prices finalized
- [ ] Domain DNS pointed at Vercel
- [ ] Resend domain verified (DKIM/SPF set)
- [ ] Razorpay live keys in Vercel env vars
- [ ] Webhook URL configured in Razorpay
- [ ] Test purchase with own card for the cheapest item — refund afterward
- [ ] Mobile checkout tested on a real phone
- [ ] Order confirmation email received by both customer and owner

## Tech stack

- Next.js 15 + TypeScript + Tailwind v4
- Razorpay Standard Checkout for payments
- Resend for transactional email
- Vercel for hosting
- No database — product catalog lives in `src/data/products.ts`, orders live in Razorpay
