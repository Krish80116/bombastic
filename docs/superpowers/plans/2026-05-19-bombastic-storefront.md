# Bombastic Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom-coded streetwear storefront for the India-based brand "Bombastic" that supports real online purchases via Razorpay, runs on Vercel at ~₹0 monthly fixed cost, and uses a two-surface (dark/light) visual system.

**Architecture:** Next.js 15 (App Router) + TypeScript single-app monorepo. Server actions / route handlers handle order creation and Razorpay webhook verification. Products live in a typed file (no DB). Cart is client-state + localStorage. Razorpay is the source of truth for orders; Resend delivers confirmation emails.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind 4, Vitest (tests), Razorpay Node SDK, Resend, Vercel (hosting).

---

## Spec reference

The full design lives at `docs/superpowers/specs/2026-05-19-bombastic-design.md`. Open questions resolved during the build (domain, real product photos, KYC) are owner decisions and do not block this plan.

## File structure (high level)

```
bombastic/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          root layout, fonts, cart provider
│   │   ├── globals.css                         Tailwind v4 + theme tokens
│   │   ├── page.tsx                            home (dark)
│   │   ├── shop/page.tsx                       shop grid (dark)
│   │   ├── shop/[slug]/page.tsx                product detail (light)
│   │   ├── cart/page.tsx                       cart (light)
│   │   ├── checkout/page.tsx                   checkout (light)
│   │   ├── orders/[razorpayOrderId]/page.tsx   confirmation (light)
│   │   ├── about/page.tsx                      about (dark)
│   │   ├── contact/page.tsx                    contact (light)
│   │   ├── policies/shipping/page.tsx
│   │   ├── policies/returns/page.tsx
│   │   ├── policies/privacy/page.tsx
│   │   ├── policies/terms/page.tsx
│   │   └── api/
│   │       ├── checkout/route.ts               POST: create Razorpay order
│   │       ├── checkout/verify/route.ts        POST: client-side payment verify
│   │       └── webhooks/razorpay/route.ts      POST: server-side webhook
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── BrandMark.tsx                       wordmark variants
│   │   ├── ProductCard.tsx                     shop grid card
│   │   ├── SurfaceLayout.tsx                   dark/light wrapper
│   │   ├── CartProvider.tsx                    React Context + localStorage
│   │   ├── CartIcon.tsx                        nav cart count
│   │   └── RazorpayScript.tsx                  loads checkout.js
│   ├── data/
│   │   └── products.ts                         typed product catalog (source of truth)
│   ├── lib/
│   │   ├── cart-math.ts                        pure cart computation
│   │   ├── receipt.ts                          friendly receipt id generator
│   │   ├── razorpay.ts                         server-side Razorpay client + signature verify
│   │   ├── email.ts                            Resend client + order email template
│   │   └── validation.ts                       shipping form validators
│   └── types/
│       └── product.ts
├── public/products/                            product images
├── __tests__/                                  Vitest tests
├── package.json
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── .env.local.example
```

---

### Task 1: Initialize the Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, `README.md`

- [ ] **Step 1: Scaffold with create-next-app**

Run from `C:\Users\krish\Desktop\Bombastic`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

When prompted "would you like to customize the default import alias?" pick the defaults. The dot tells it to scaffold *into the current directory*.

Expected: `package.json`, `src/app/`, `tailwind`-aware `globals.css`, and `next.config.ts` created.

- [ ] **Step 2: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000 — you should see the default Next.js welcome page. Stop the server with Ctrl+C.

- [ ] **Step 3: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold next.js project"
```

Expected: clean working tree after commit.

---

### Task 2: Install runtime + dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install razorpay resend clsx
```

`razorpay` is the official Node SDK. `resend` is the email SDK. `clsx` is for conditional classes.

- [ ] **Step 2: Install dev deps for testing**

```bash
npm install -D vitest @vitest/ui @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install razorpay, resend, testing deps"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2: Create `__tests__/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` object, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Add a smoke test to confirm Vitest works**

Create `__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the smoke test**

```bash
npm test
```

Expected: `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts __tests__/ package.json
git commit -m "chore: configure vitest"
```

---

### Task 4: Configure Tailwind v4 with design tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the contents of `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg-dark: #0a0a0a;
  --color-bg-light: #f3f1ec;
  --color-text-dark: #ececec;
  --color-text-light: #0a0a0a;
  --color-muted-dark: #888888;
  --color-muted-light: #666666;
  --color-accent: #ff3b2f;

  --font-display: var(--font-inter), "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-body: var(--font-inter), "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: var(--font-jetbrains-mono), "JetBrains Mono", "Courier New", monospace;
}

html, body {
  background: var(--color-bg-dark);
  color: var(--color-text-dark);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
* { box-sizing: border-box; }
```

- [ ] **Step 2: Confirm dev server still renders**

```bash
npm run dev
```

Open http://localhost:3000 — page should now have a black background. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: tailwind theme tokens for dark and light surfaces"
```

---

### Task 5: Add fonts via next/font

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bombastic',
  description: 'Heavyweight cotton tees. Small runs. Printed in India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Confirm fonts load**

```bash
npm run dev
```

Inspect the page in the browser — `font-family` on `body` should include `Inter`. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: load Inter and JetBrains Mono via next/font"
```

---

### Task 6: Define product types

**Files:**
- Create: `src/types/product.ts`

- [ ] **Step 1: Create the type file**

```ts
export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ProductSizeStock = {
  size: ProductSize;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  priceInr: number;
  description: string;
  materials: string;
  images: string[];
  sizes: ProductSizeStock[];
  dropId: string;
  status: 'live' | 'sold_out' | 'archived';
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/product.ts
git commit -m "feat: product type"
```

---

### Task 7: Seed sample product catalog

**Files:**
- Create: `src/data/products.ts`
- Create: `public/products/.gitkeep`

- [ ] **Step 1: Create the catalog**

```ts
import type { Product } from '@/types/product';

export const products: Product[] = [
  {
    slug: 'static-tee-black',
    name: 'Static Tee — Black',
    priceInr: 1499,
    description:
      'Inaugural Bombastic tee. Oversized fit, dropped shoulder, heavyweight cotton. Front chest print, back full-bleed graphic.',
    materials: '240gsm 100% cotton. Screen-printed in Delhi.',
    images: ['/products/static-tee-black-1.jpg', '/products/static-tee-black-2.jpg'],
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 6 },
      { size: 'XXL', stock: 3 },
    ],
    dropId: 'drop-01',
    status: 'live',
  },
  {
    slug: 'static-tee-bone',
    name: 'Static Tee — Bone',
    priceInr: 1499,
    description:
      'Companion to the black Static Tee. Same heavyweight cotton, oversized cut. Off-white body, charcoal print.',
    materials: '240gsm 100% cotton. Screen-printed in Delhi.',
    images: ['/products/static-tee-bone-1.jpg', '/products/static-tee-bone-2.jpg'],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 7 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 2 },
    ],
    dropId: 'drop-01',
    status: 'live',
  },
  {
    slug: 'noise-tee-charcoal',
    name: 'Noise Tee — Charcoal',
    priceInr: 1599,
    description:
      'Heavyweight charcoal tee. Center-front wordmark, mono-type sleeve detail.',
    materials: '240gsm 100% cotton. Screen-printed in Delhi.',
    images: ['/products/noise-tee-charcoal-1.jpg'],
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 2 },
    ],
    dropId: 'drop-01',
    status: 'live',
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getStock(product: Product, size: string): number {
  return product.sizes.find((s) => s.size === size)?.stock ?? 0;
}
```

- [ ] **Step 2: Create placeholder image directory**

```bash
mkdir -p public/products
touch public/products/.gitkeep
```

(On Windows bash, `mkdir -p` and `touch` both work.)

- [ ] **Step 3: Commit**

```bash
git add src/data/products.ts public/products/.gitkeep
git commit -m "feat: seed sample product catalog"
```

---

### Task 8: Cart math — failing test

**Files:**
- Create: `__tests__/cart-math.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { computeCartTotals, type CartEntry } from '@/lib/cart-math';
import type { Product } from '@/types/product';

const tee: Product = {
  slug: 'tee',
  name: 'Tee',
  priceInr: 1000,
  description: '',
  materials: '',
  images: [],
  sizes: [{ size: 'M', stock: 5 }],
  dropId: 'd',
  status: 'live',
};

describe('computeCartTotals', () => {
  it('returns zero for an empty cart', () => {
    const result = computeCartTotals([], [tee]);
    expect(result.subtotalInr).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.lines).toEqual([]);
  });

  it('sums line totals correctly', () => {
    const cart: CartEntry[] = [{ slug: 'tee', size: 'M', qty: 2 }];
    const result = computeCartTotals(cart, [tee]);
    expect(result.subtotalInr).toBe(2000);
    expect(result.itemCount).toBe(2);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatchObject({ slug: 'tee', size: 'M', qty: 2, lineTotalInr: 2000 });
  });

  it('drops entries that reference unknown slugs', () => {
    const cart: CartEntry[] = [{ slug: 'ghost', size: 'M', qty: 1 }];
    const result = computeCartTotals(cart, [tee]);
    expect(result.subtotalInr).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.lines).toEqual([]);
  });

  it('clamps qty to available stock', () => {
    const cart: CartEntry[] = [{ slug: 'tee', size: 'M', qty: 99 }];
    const result = computeCartTotals(cart, [tee]);
    expect(result.lines[0].qty).toBe(5);
    expect(result.subtotalInr).toBe(5000);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- cart-math
```

Expected: FAIL with "Cannot find module '@/lib/cart-math'".

---

### Task 9: Cart math — implementation

**Files:**
- Create: `src/lib/cart-math.ts`

- [ ] **Step 1: Implement**

```ts
import type { Product, ProductSize } from '@/types/product';

export type CartEntry = {
  slug: string;
  size: ProductSize;
  qty: number;
};

export type CartLine = {
  slug: string;
  size: ProductSize;
  qty: number;
  unitPriceInr: number;
  lineTotalInr: number;
  product: Product;
};

export type CartTotals = {
  lines: CartLine[];
  itemCount: number;
  subtotalInr: number;
};

export function computeCartTotals(cart: CartEntry[], catalog: Product[]): CartTotals {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const lines: CartLine[] = [];

  for (const entry of cart) {
    const product = bySlug.get(entry.slug);
    if (!product) continue;
    const sizeRow = product.sizes.find((s) => s.size === entry.size);
    if (!sizeRow) continue;
    const qty = Math.max(0, Math.min(entry.qty, sizeRow.stock));
    if (qty === 0) continue;
    lines.push({
      slug: product.slug,
      size: entry.size,
      qty,
      unitPriceInr: product.priceInr,
      lineTotalInr: product.priceInr * qty,
      product,
    });
  }

  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotalInr = lines.reduce((sum, l) => sum + l.lineTotalInr, 0);

  return { lines, itemCount, subtotalInr };
}
```

- [ ] **Step 2: Run tests, confirm pass**

```bash
npm test -- cart-math
```

Expected: 4 tests passing.

- [ ] **Step 3: Commit**

```bash
git add __tests__/cart-math.test.ts src/lib/cart-math.ts
git commit -m "feat: cart total computation with stock clamping"
```

---

### Task 10: Receipt id generator — failing test

**Files:**
- Create: `__tests__/receipt.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { generateReceiptId } from '@/lib/receipt';

describe('generateReceiptId', () => {
  it('starts with BMB-', () => {
    expect(generateReceiptId()).toMatch(/^BMB-/);
  });

  it('is unique across rapid calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateReceiptId()));
    expect(ids.size).toBe(100);
  });

  it('fits within Razorpay receipt length (40 chars)', () => {
    expect(generateReceiptId().length).toBeLessThanOrEqual(40);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- receipt
```

Expected: FAIL with "Cannot find module '@/lib/receipt'".

---

### Task 11: Receipt id generator — implementation

**Files:**
- Create: `src/lib/receipt.ts`

- [ ] **Step 1: Implement**

```ts
export function generateReceiptId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BMB-${ts}-${rand}`;
}
```

- [ ] **Step 2: Run tests, confirm pass**

```bash
npm test -- receipt
```

Expected: 3 tests passing.

- [ ] **Step 3: Commit**

```bash
git add __tests__/receipt.test.ts src/lib/receipt.ts
git commit -m "feat: receipt id generator"
```

---

### Task 12: Shipping form validation — failing test

**Files:**
- Create: `__tests__/validation.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, it, expect } from 'vitest';
import { validateShipping, type ShippingForm } from '@/lib/validation';

const valid: ShippingForm = {
  fullName: 'Test User',
  phone: '9876543210',
  email: 'test@example.com',
  addressLine1: '123 Some Street',
  addressLine2: '',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
};

describe('validateShipping', () => {
  it('accepts a valid form', () => {
    const result = validateShipping(valid);
    expect(result.ok).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = validateShipping({ ...valid, fullName: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fullName).toBeDefined();
  });

  it('rejects an invalid Indian phone', () => {
    const result = validateShipping({ ...valid, phone: '12345' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });

  it('rejects an invalid pincode', () => {
    const result = validateShipping({ ...valid, pincode: '12' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.pincode).toBeDefined();
  });

  it('rejects a malformed email', () => {
    const result = validateShipping({ ...valid, email: 'notanemail' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- validation
```

Expected: FAIL with "Cannot find module '@/lib/validation'".

---

### Task 13: Shipping form validation — implementation

**Files:**
- Create: `src/lib/validation.ts`

- [ ] **Step 1: Implement**

```ts
export type ShippingForm = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

export type ValidationResult =
  | { ok: true; value: ShippingForm }
  | { ok: false; errors: Partial<Record<keyof ShippingForm, string>> };

const INDIAN_PHONE = /^[6-9]\d{9}$/;
const PINCODE = /^\d{6}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShipping(input: ShippingForm): ValidationResult {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};

  if (!input.fullName.trim()) errors.fullName = 'Required';
  if (!INDIAN_PHONE.test(input.phone)) errors.phone = '10-digit Indian mobile';
  if (!EMAIL.test(input.email)) errors.email = 'Valid email required';
  if (!input.addressLine1.trim()) errors.addressLine1 = 'Required';
  if (!input.city.trim()) errors.city = 'Required';
  if (!input.state.trim()) errors.state = 'Required';
  if (!PINCODE.test(input.pincode)) errors.pincode = '6 digits';

  if (Object.keys(errors).length === 0) return { ok: true, value: input };
  return { ok: false, errors };
}
```

- [ ] **Step 2: Run tests, confirm pass**

```bash
npm test -- validation
```

Expected: 5 tests passing.

- [ ] **Step 3: Commit**

```bash
git add __tests__/validation.test.ts src/lib/validation.ts
git commit -m "feat: shipping form validation"
```

---

### Task 14: Cart provider (React Context + localStorage)

**Files:**
- Create: `src/components/CartProvider.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { CartEntry } from '@/lib/cart-math';
import type { ProductSize } from '@/types/product';

const STORAGE_KEY = 'bombastic.cart.v1';

type CartContextValue = {
  entries: CartEntry[];
  add: (slug: string, size: ProductSize, qty: number) => void;
  remove: (slug: string, size: ProductSize) => void;
  setQty: (slug: string, size: ProductSize, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // corrupt localStorage -> ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  function add(slug: string, size: ProductSize, qty: number) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.slug === slug && e.size === size);
      if (idx === -1) return [...prev, { slug, size, qty }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
  }

  function remove(slug: string, size: ProductSize) {
    setEntries((prev) => prev.filter((e) => !(e.slug === slug && e.size === size)));
  }

  function setQty(slug: string, size: ProductSize, qty: number) {
    if (qty <= 0) return remove(slug, size);
    setEntries((prev) =>
      prev.map((e) => (e.slug === slug && e.size === size ? { ...e, qty } : e)),
    );
  }

  function clear() {
    setEntries([]);
  }

  return (
    <CartContext.Provider value={{ entries, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

- [ ] **Step 2: Wire provider into root layout**

Edit `src/app/layout.tsx` to import and wrap `<body>` children:

```tsx
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bombastic',
  description: 'Heavyweight cotton tees. Small runs. Printed in India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Confirm build still passes**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/CartProvider.tsx src/app/layout.tsx
git commit -m "feat: cart provider with localStorage persistence"
```

---

### Task 15: Brand mark component

**Files:**
- Create: `src/components/BrandMark.tsx`

- [ ] **Step 1: Implement**

```tsx
import clsx from 'clsx';

type Props = {
  variant?: 'clean' | 'hero';
  className?: string;
};

export function BrandMark({ variant = 'clean', className }: Props) {
  if (variant === 'hero') {
    return (
      <span
        className={clsx(
          'font-display font-extrabold uppercase leading-[0.88] tracking-[-0.035em]',
          className,
        )}
      >
        Bomb/<br />astic<span className="text-[var(--color-accent)]">_</span>
      </span>
    );
  }
  return (
    <span className={clsx('font-display font-semibold tracking-tight', className)}>
      Bombastic<sup className="text-[0.5em] align-super">®</sup>
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BrandMark.tsx
git commit -m "feat: brand mark component (clean + hero variants)"
```

---

### Task 16: Surface layout component

**Files:**
- Create: `src/components/SurfaceLayout.tsx`

- [ ] **Step 1: Implement**

```tsx
import clsx from 'clsx';

type Props = {
  surface: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
};

export function SurfaceLayout({ surface, children, className }: Props) {
  const base =
    surface === 'dark'
      ? 'bg-[var(--color-bg-dark)] text-[var(--color-text-dark)]'
      : 'bg-[var(--color-bg-light)] text-[var(--color-text-light)]';
  return <div className={clsx('min-h-screen', base, className)}>{children}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SurfaceLayout.tsx
git commit -m "feat: surface layout wrapper"
```

---

### Task 17: Nav component (surface-aware) with cart icon

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/CartIcon.tsx`

- [ ] **Step 1: Create `src/components/CartIcon.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function CartIcon({ tone }: { tone: 'dark' | 'light' }) {
  const { entries } = useCart();
  const count = entries.reduce((sum, e) => sum + e.qty, 0);
  return (
    <Link href="/cart" className="font-mono text-[10px] tracking-[0.2em] uppercase">
      Cart [{count}]
    </Link>
  );
}
```

- [ ] **Step 2: Create `src/components/Nav.tsx`**

```tsx
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { CartIcon } from './CartIcon';
import clsx from 'clsx';

type Props = { surface: 'dark' | 'light' };

export function Nav({ surface }: Props) {
  const brandColor =
    surface === 'dark' ? 'text-[var(--color-text-dark)]' : 'text-[var(--color-text-light)]';
  const linksColor =
    surface === 'dark' ? 'text-[var(--color-muted-dark)]' : 'text-[var(--color-muted-light)]';

  return (
    <nav
      className={clsx(
        'flex items-center justify-between px-7 py-6 font-mono text-[10px] tracking-[0.2em] uppercase',
        linksColor,
      )}
    >
      <Link href="/" className={brandColor}>
        <BrandMark variant="clean" />
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
        <CartIcon tone={surface} />
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx src/components/CartIcon.tsx
git commit -m "feat: nav and cart icon"
```

---

### Task 18: Footer component

**Files:**
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link';
import clsx from 'clsx';

type Props = { surface: 'dark' | 'light' };

export function Footer({ surface }: Props) {
  return (
    <footer
      className={clsx(
        'mt-32 border-t px-7 py-10 font-mono text-[10px] tracking-[0.2em] uppercase',
        surface === 'dark'
          ? 'border-white/10 text-[var(--color-muted-dark)]'
          : 'border-black/10 text-[var(--color-muted-light)]',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>© Bombastic — Drop 01</div>
        <div className="flex flex-wrap gap-6">
          <Link href="/policies/shipping">Shipping</Link>
          <Link href="/policies/returns">Returns</Link>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: footer with policy links"
```

---

### Task 19: Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { BrandMark } from '@/components/BrandMark';
import { products } from '@/data/products';

export default function HomePage() {
  const featured = products.filter((p) => p.status === 'live').slice(0, 3);

  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />

      <section className="px-7 pt-12 pb-32">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-4">
          [ DROP_01 / LIVE / {products.filter((p) => p.dropId === 'drop-01').length} PIECES ]
        </div>

        <h1 className="text-[88px] md:text-[120px]">
          <BrandMark variant="hero" />
        </h1>

        <p className="mt-8 max-w-md font-mono text-xs leading-relaxed text-[var(--color-muted-dark)]">
          Heavyweight cotton. Small runs. Printed in Delhi. When it&apos;s gone it&apos;s gone.
        </p>

        <Link
          href="/shop"
          className="inline-block mt-10 bg-[var(--color-text-dark)] text-[var(--color-bg-dark)] px-6 py-3 font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Enter Store →
        </Link>
      </section>

      <section className="px-7 pb-24">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)] mb-6">
          // FEATURED
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="block">
              <div className="aspect-[3/4] bg-white/5 mb-3 flex items-center justify-center">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)]">
                  {p.name}
                </span>
              </div>
              <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] uppercase">
                <span>{p.name}</span>
                <span>₹ {p.priceInr.toLocaleString('en-IN')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Confirm dev renders correctly**

```bash
npm run dev
```

Open http://localhost:3000 — should show dark hero, brand mark, 3 featured product cards with placeholder boxes. Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: home page with hero and featured products"
```

---

### Task 20: Product card component

**Files:**
- Create: `src/components/ProductCard.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  const totalStock = product.sizes.reduce((s, x) => s + x.stock, 0);
  const isSoldOut = product.status === 'sold_out' || totalStock === 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={isSoldOut ? 'block opacity-40 pointer-events-none' : 'block'}
    >
      <div className="aspect-[3/4] bg-white/5 mb-3 flex items-center justify-center">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)]">
          {product.name}
        </span>
      </div>
      <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] uppercase">
        <span>{product.name}</span>
        <span>{isSoldOut ? 'Sold Out' : `₹ ${product.priceInr.toLocaleString('en-IN')}`}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "feat: product card"
```

---

### Task 21: Shop grid page

**Files:**
- Create: `src/app/shop/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';

export default function ShopPage() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 pt-8 pb-24">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-6">
          [ DROP_01 / {products.length} PIECES ]
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to http://localhost:3000/shop — should show the three products in a dark grid. Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/app/shop/page.tsx
git commit -m "feat: shop grid page"
```

---

### Task 22: Product detail page

**Files:**
- Create: `src/app/shop/[slug]/page.tsx`
- Create: `src/components/AddToCartForm.tsx`

- [ ] **Step 1: Create the client form `src/components/AddToCartForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import type { Product, ProductSize } from '@/types/product';

export function AddToCartForm({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const [selected, setSelected] = useState<ProductSize | null>(
    availableSizes[0]?.size ?? null,
  );

  function handleAdd() {
    if (!selected) return;
    add(product.slug, selected, 1);
    router.push('/cart');
  }

  return (
    <div className="mt-8">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted-light)] mb-3">
        Size
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {product.sizes.map((s) => {
          const out = s.stock === 0;
          const active = selected === s.size;
          return (
            <button
              key={s.size}
              type="button"
              onClick={() => !out && setSelected(s.size)}
              disabled={out}
              className={`px-4 py-2 border font-mono text-xs ${
                out
                  ? 'border-black/20 text-black/30 line-through cursor-not-allowed'
                  : active
                    ? 'border-black bg-black text-[var(--color-bg-light)]'
                    : 'border-black/30'
              }`}
            >
              {s.size}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selected}
        className="w-full md:w-auto px-8 py-4 bg-black text-[var(--color-bg-light)] font-mono text-[11px] tracking-[0.25em] uppercase disabled:opacity-40"
      >
        Add to Cart — ₹ {product.priceInr.toLocaleString('en-IN')}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create the product detail page**

```tsx
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { AddToCartForm } from '@/components/AddToCartForm';
import { getProduct, products } from '@/data/products';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />

      <section className="px-7 pt-8 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[3/4] bg-black/5 flex items-center justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-light)]">
              {product.name}
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-light)] mb-2">
            // {product.dropId.toUpperCase()}
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">{product.name}</h1>
          <div className="font-mono text-sm mt-2">₹ {product.priceInr.toLocaleString('en-IN')}</div>

          <p className="mt-6 max-w-md text-sm leading-relaxed">{product.description}</p>

          <div className="mt-6 font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted-light)]">
            {product.materials}
          </div>

          <AddToCartForm product={product} />
        </div>
      </section>

      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/shop/static-tee-black — light-surface product page with size buttons. Click "Add to Cart" — should navigate to `/cart` (will 404 until next task). Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/shop/\[slug\]/page.tsx src/components/AddToCartForm.tsx
git commit -m "feat: product detail page with add-to-cart"
```

---

### Task 23: Cart page

**Files:**
- Create: `src/app/cart/page.tsx`
- Create: `src/components/CartView.tsx`

- [ ] **Step 1: Create the client cart view `src/components/CartView.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { computeCartTotals } from '@/lib/cart-math';
import { products } from '@/data/products';

export function CartView() {
  const { entries, setQty, remove } = useCart();
  const { lines, subtotalInr, itemCount } = computeCartTotals(entries, products);

  if (lines.length === 0) {
    return (
      <div className="px-7 py-24">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted-light)]">
          Cart is empty.
        </div>
        <Link
          href="/shop"
          className="inline-block mt-6 px-6 py-3 bg-black text-[var(--color-bg-light)] font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Shop Drop 01 →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-7 py-12">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)] mb-6">
        Cart — {itemCount} item{itemCount === 1 ? '' : 's'}
      </div>

      <div className="border-t border-black/10">
        {lines.map((l) => (
          <div
            key={`${l.slug}-${l.size}`}
            className="grid grid-cols-[80px_1fr_auto] gap-4 border-b border-black/10 py-5 items-center"
          >
            <div className="aspect-[3/4] bg-black/5" />
            <div>
              <div className="font-display text-base">{l.product.name}</div>
              <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted-light)] mt-1">
                Size {l.size} · ₹ {l.unitPriceInr.toLocaleString('en-IN')}
              </div>
              <div className="flex gap-3 mt-2 items-center font-mono text-xs">
                <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} className="px-2">
                  −
                </button>
                <span>{l.qty}</span>
                <button onClick={() => setQty(l.slug, l.size, l.qty + 1)} className="px-2">
                  +
                </button>
                <button
                  onClick={() => remove(l.slug, l.size)}
                  className="ml-4 underline text-[var(--color-muted-light)]"
                >
                  remove
                </button>
              </div>
            </div>
            <div className="font-mono text-sm">₹ {l.lineTotalInr.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase">Subtotal</div>
        <div className="font-mono text-lg">₹ {subtotalInr.toLocaleString('en-IN')}</div>
      </div>

      <Link
        href="/checkout"
        className="inline-block mt-6 px-8 py-4 bg-black text-[var(--color-bg-light)] font-mono text-[11px] tracking-[0.25em] uppercase"
      >
        Checkout →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/cart/page.tsx`**

```tsx
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { CartView } from '@/components/CartView';

export default function CartPage() {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <CartView />
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 3: Manual test**

```bash
npm run dev
```

Add a product to cart, view `/cart`, change qty, remove. Refresh — cart should persist. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/cart/page.tsx src/components/CartView.tsx
git commit -m "feat: cart page with qty edit, remove, persistence"
```

---

### Task 24: Environment variables template

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.local.example`**

```
# Razorpay — get from https://dashboard.razorpay.com/app/keys
# Use TEST keys until live launch (rzp_test_... )
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
RAZORPAY_WEBHOOK_SECRET=ZZZZZZZZZZZZZZZZZZZZ

# Public copy of the key id (safe to expose) — used by the checkout modal
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX

# Resend — get from https://resend.com/api-keys
RESEND_API_KEY=re_XXXXXXXXXXXX

# Where order notifications go to the brand owner
ORDER_NOTIFICATION_EMAIL=hello@bombastic.in

# From address that emails appear from. Must be a verified domain in Resend.
EMAIL_FROM=Bombastic <orders@bombastic.in>

# Public site URL (used for absolute links in emails)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: Ensure `.env*.local` is gitignored**

Open `.gitignore` and confirm there's a line like `.env*.local`. If not, append it.

- [ ] **Step 3: Create `.env.local` from the template**

```bash
cp .env.local.example .env.local
```

Owner will fill in real values later. Tests run without real values.

- [ ] **Step 4: Commit (template only — `.env.local` is gitignored)**

```bash
git add .env.local.example .gitignore
git commit -m "chore: env template for razorpay + resend"
```

---

### Task 25: Razorpay server library — failing test

**Files:**
- Create: `__tests__/razorpay-signature.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { verifyPaymentSignature, verifyWebhookSignature } from '@/lib/razorpay';

describe('verifyPaymentSignature', () => {
  it('accepts a valid signature', () => {
    const secret = 'test_secret';
    const orderId = 'order_ABC';
    const paymentId = 'pay_XYZ';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    expect(verifyPaymentSignature({ orderId, paymentId, signature }, secret)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    expect(
      verifyPaymentSignature(
        { orderId: 'order_ABC', paymentId: 'pay_XYZ', signature: 'deadbeef' },
        'test_secret',
      ),
    ).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  it('accepts a valid webhook signature', () => {
    const secret = 'whsec_test';
    const body = '{"event":"payment.captured"}';
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it('rejects a forged webhook signature', () => {
    expect(
      verifyWebhookSignature('{"event":"payment.captured"}', 'forged', 'whsec_test'),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- razorpay-signature
```

Expected: FAIL "Cannot find module '@/lib/razorpay'".

---

### Task 26: Razorpay server library — implementation

**Files:**
- Create: `src/lib/razorpay.ts`

- [ ] **Step 1: Implement**

```ts
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

let cached: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cached) return cached;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error('Razorpay keys not configured');
  cached = new Razorpay({ key_id, key_secret });
  return cached;
}

type VerifyPaymentArgs = {
  orderId: string;
  paymentId: string;
  signature: string;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function verifyPaymentSignature(
  { orderId, paymentId, signature }: VerifyPaymentArgs,
  secret: string = process.env.RAZORPAY_KEY_SECRET ?? '',
): boolean {
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return timingSafeEqualHex(expected, signature);
}
```

- [ ] **Step 2: Run tests, confirm pass**

```bash
npm test -- razorpay-signature
```

Expected: 4 tests passing.

- [ ] **Step 3: Commit**

```bash
git add __tests__/razorpay-signature.test.ts src/lib/razorpay.ts
git commit -m "feat: razorpay signature verification (timing-safe)"
```

---

### Task 27: Checkout API — failing test for tampered price

**Files:**
- Create: `__tests__/checkout-api.test.ts`

- [ ] **Step 1: Write the test**

This test verifies the server *recomputes* totals from `products.ts` and ignores client-supplied prices.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/razorpay', () => {
  return {
    getRazorpay: () => ({
      orders: {
        create: vi.fn(async (opts: { amount: number }) => ({
          id: 'order_TEST',
          amount: opts.amount,
          currency: 'INR',
          status: 'created',
          notes: {},
        })),
      },
    }),
  };
});

import { POST } from '@/app/api/checkout/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validShipping = {
  fullName: 'Test User',
  phone: '9876543210',
  email: 'test@example.com',
  addressLine1: '1 Street',
  addressLine2: '',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid shipping', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 1 }],
        shipping: { ...validShipping, pincode: '00' },
      }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects empty cart', async () => {
    const res = await POST(
      makeRequest({ cart: [], shipping: validShipping }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects out-of-stock qty', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 9999 }],
        shipping: validShipping,
      }),
    );
    expect(res.status).toBe(409);
  });

  it('uses server-side price even if client tries to inject one', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 1, priceInr: 1 }],
        shipping: validShipping,
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    // server should use 1499 from products.ts (in paise = 149900), not 1 from client
    expect(json.amount).toBe(149900);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- checkout-api
```

Expected: FAIL "Cannot find module '@/app/api/checkout/route'".

---

### Task 28: Checkout API — implementation

**Files:**
- Create: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';
import { computeCartTotals } from '@/lib/cart-math';
import { products, getProduct, getStock } from '@/data/products';
import { validateShipping, type ShippingForm } from '@/lib/validation';
import { generateReceiptId } from '@/lib/receipt';
import type { ProductSize } from '@/types/product';

type CheckoutRequestBody = {
  cart: Array<{ slug: string; size: ProductSize; qty: number }>;
  shipping: ShippingForm;
};

export async function POST(req: Request) {
  let body: CheckoutRequestBody;
  try {
    body = (await req.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const shippingResult = validateShipping(body.shipping ?? ({} as ShippingForm));
  if (!shippingResult.ok) {
    return NextResponse.json(
      { error: 'invalid_shipping', errors: shippingResult.errors },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.cart) || body.cart.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  for (const entry of body.cart) {
    const product = getProduct(entry.slug);
    if (!product) {
      return NextResponse.json(
        { error: 'unknown_product', slug: entry.slug },
        { status: 409 },
      );
    }
    const stock = getStock(product, entry.size);
    if (entry.qty <= 0 || entry.qty > stock) {
      return NextResponse.json(
        { error: 'out_of_stock', slug: entry.slug, size: entry.size, available: stock },
        { status: 409 },
      );
    }
  }

  const totals = computeCartTotals(
    body.cart.map((e) => ({ slug: e.slug, size: e.size, qty: e.qty })),
    products,
  );

  const amountInPaise = totals.subtotalInr * 100;
  const receiptId = generateReceiptId();

  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
    notes: {
      receiptId,
      shipping: JSON.stringify(shippingResult.value),
      cart: JSON.stringify(totals.lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty }))),
    },
  });

  return NextResponse.json({
    razorpayOrderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    receiptId,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
```

- [ ] **Step 2: Run tests, confirm pass**

```bash
npm test -- checkout-api
```

Expected: 4 tests passing.

- [ ] **Step 3: Commit**

```bash
git add __tests__/checkout-api.test.ts src/app/api/checkout/route.ts
git commit -m "feat: checkout endpoint with server-side price recomputation"
```

---

### Task 29: Checkout verify endpoint

**Files:**
- Create: `src/app/api/checkout/verify/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';

type VerifyBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const ok = verifyPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });

  if (!ok) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/checkout/verify/route.ts
git commit -m "feat: client-side payment verification endpoint"
```

---

### Task 30: Email library

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Implement**

```ts
import { Resend } from 'resend';

let cached: Resend | null = null;

function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not configured');
  cached = new Resend(key);
  return cached;
}

export type OrderEmailData = {
  receiptId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountInPaise: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  lines: Array<{ name: string; size: string; qty: number; lineTotalInr: number }>;
};

function formatRupees(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function renderOrderHtml(data: OrderEmailData): string {
  const linesHtml = data.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${l.name} — ${l.size} × ${l.qty}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">₹ ${l.lineTotalInr.toLocaleString('en-IN')}</td></tr>`,
    )
    .join('');
  return `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0a0a">
  <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#666">Bombastic — Order Confirmed</div>
  <h1 style="font-size:28px;margin:16px 0 4px">Thanks for your order.</h1>
  <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#666">Receipt: ${data.receiptId}</div>
  <table style="width:100%;border-collapse:collapse;margin-top:24px">${linesHtml}</table>
  <div style="display:flex;justify-content:space-between;margin-top:16px;font-weight:600"><span>Total</span><span>${formatRupees(data.amountInPaise)}</span></div>
  <div style="margin-top:32px;font-size:13px;line-height:1.6">
    <strong>Shipping to</strong><br>
    ${data.customer.fullName}<br>
    ${data.customer.addressLine1}${data.customer.addressLine2 ? '<br>' + data.customer.addressLine2 : ''}<br>
    ${data.customer.city}, ${data.customer.state} — ${data.customer.pincode}<br>
    ${data.customer.phone}
  </div>
  <p style="margin-top:32px;font-size:12px;color:#666">Drop a reply to this email if anything needs fixing. We ship within 3 business days.</p>
</div>`;
}

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const from = process.env.EMAIL_FROM;
  const ownerAddr = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!from || !ownerAddr) throw new Error('Email env not configured');

  const html = renderOrderHtml(data);
  const subject = `Bombastic — order ${data.receiptId}`;
  const resend = getResend();

  // Customer
  await resend.emails.send({
    from,
    to: data.customer.email,
    subject,
    html,
  });

  // Owner notification (same body — owner uses this to ship)
  await resend.emails.send({
    from,
    to: ownerAddr,
    subject: `[NEW ORDER] ${data.receiptId} — ${data.customer.fullName}`,
    html,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: order confirmation email via resend"
```

---

### Task 31: Razorpay webhook endpoint

**Files:**
- Create: `src/app/api/webhooks/razorpay/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from 'next/server';
import { getRazorpay, verifyWebhookSignature } from '@/lib/razorpay';
import { sendOrderEmails, type OrderEmailData } from '@/lib/email';
import { getProduct } from '@/data/products';

export const runtime = 'nodejs';

// Module-level in-memory dedupe — survives within a single serverless instance.
// Razorpay also retries idempotently; downstream effect (email) is the only
// thing that needs guarding, and a duplicate within the same instance is
// covered here. Cross-instance duplicates are acceptable at v1 volume.
const processedPayments = new Set<string>();

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  let payload: {
    event: string;
    payload: { payment: { entity: { id: string; order_id: string; amount: number } } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, ignored: payload.event });
  }

  const payment = payload.payload.payment.entity;
  if (processedPayments.has(payment.id)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  processedPayments.add(payment.id);

  // Fetch the order to get notes (cart + shipping)
  const rzp = getRazorpay();
  const order = (await rzp.orders.fetch(payment.order_id)) as unknown as {
    id: string;
    notes: { receiptId?: string; cart?: string; shipping?: string };
  };

  const cart = JSON.parse(order.notes.cart ?? '[]') as Array<{
    slug: string;
    size: string;
    qty: number;
  }>;
  const shipping = JSON.parse(order.notes.shipping ?? '{}') as OrderEmailData['customer'];

  const lines = cart
    .map((entry) => {
      const product = getProduct(entry.slug);
      if (!product) return null;
      return {
        name: product.name,
        size: entry.size,
        qty: entry.qty,
        lineTotalInr: product.priceInr * entry.qty,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  try {
    await sendOrderEmails({
      receiptId: order.notes.receiptId ?? order.id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amountInPaise: payment.amount,
      customer: shipping,
      lines,
    });
  } catch (err) {
    // Order is still complete — Razorpay is source of truth.
    console.error('email send failed', err);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/webhooks/razorpay/route.ts
git commit -m "feat: razorpay webhook with signature verify and dedupe"
```

---

### Task 32: Razorpay script loader component

**Files:**
- Create: `src/components/RazorpayScript.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client';

import Script from 'next/script';

export function RazorpayScript() {
  return <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RazorpayScript.tsx
git commit -m "feat: razorpay checkout script loader"
```

---

### Task 33: Checkout page

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/components/CheckoutForm.tsx`

- [ ] **Step 1: Create the client form `src/components/CheckoutForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { computeCartTotals } from '@/lib/cart-math';
import { products } from '@/data/products';
import { validateShipping, type ShippingForm } from '@/lib/validation';
import type { RazorpayOptions } from './RazorpayScript';

const empty: ShippingForm = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

export function CheckoutForm() {
  const { entries, clear } = useCart();
  const router = useRouter();
  const totals = computeCartTotals(entries, products);

  const [form, setForm] = useState<ShippingForm>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function field<K extends keyof ShippingForm>(key: K) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value }),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = validateShipping(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cart: entries, shipping: form }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 409 && json.error === 'out_of_stock') {
          setError(`Size ${json.size} of ${json.slug} sold out. Update your cart to continue.`);
        } else {
          setError('Could not start checkout. Please try again.');
        }
        return;
      }

      const data = (await res.json()) as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Bombastic',
        description: 'Drop 01',
        order_id: data.razorpayOrderId,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: '#0a0a0a' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) {
            setError('Payment received but verification failed. Email orders@bombastic.in with this receipt.');
            return;
          }
          clear();
          router.push(`/orders/${response.razorpay_order_id}`);
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (totals.lines.length === 0) {
    return (
      <div className="px-7 py-24">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted-light)]">
          Cart is empty.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-7 py-12 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-12"
    >
      <div className="space-y-5">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)]">
          Shipping
        </div>

        <Input label="Full name" {...field('fullName')} err={errors.fullName} />
        <Input label="Email" type="email" {...field('email')} err={errors.email} />
        <Input label="Phone (10 digits)" {...field('phone')} err={errors.phone} />
        <Input label="Address line 1" {...field('addressLine1')} err={errors.addressLine1} />
        <Input label="Address line 2 (optional)" {...field('addressLine2')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" {...field('city')} err={errors.city} />
          <Input label="State" {...field('state')} err={errors.state} />
        </div>
        <Input label="Pincode" {...field('pincode')} err={errors.pincode} />
      </div>

      <aside className="border-l border-black/10 pl-8">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)] mb-4">
          Summary
        </div>
        {totals.lines.map((l) => (
          <div key={`${l.slug}-${l.size}`} className="flex justify-between font-mono text-xs py-2">
            <span>
              {l.product.name} · {l.size} × {l.qty}
            </span>
            <span>₹ {l.lineTotalInr.toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className="flex justify-between font-mono text-sm mt-4 border-t border-black/10 pt-4">
          <span>Subtotal</span>
          <span>₹ {totals.subtotalInr.toLocaleString('en-IN')}</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--color-muted-light)] mt-2">
          Shipping calculated separately. We&apos;ll confirm after order placed.
        </div>

        {error && (
          <div className="mt-4 text-xs text-[var(--color-accent)] font-mono">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 px-8 py-4 bg-black text-[var(--color-bg-light)] font-mono text-[11px] tracking-[0.25em] uppercase disabled:opacity-40"
        >
          {submitting ? 'Opening payment…' : 'Pay with Razorpay →'}
        </button>
      </aside>
    </form>
  );
}

function Input({
  label,
  err,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; err?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted-light)] mb-1">
        {label}
      </span>
      <input
        {...props}
        className="w-full border-b border-black/30 py-2 bg-transparent focus:outline-none focus:border-black"
      />
      {err && <span className="block mt-1 text-[10px] font-mono text-[var(--color-accent)]">{err}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Create `src/app/checkout/page.tsx`**

```tsx
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { CheckoutForm } from '@/components/CheckoutForm';
import { RazorpayScript } from '@/components/RazorpayScript';

export default function CheckoutPage() {
  return (
    <SurfaceLayout surface="light">
      <RazorpayScript />
      <Nav surface="light" />
      <CheckoutForm />
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build (Razorpay env may warn but should not error since SDK is lazily instantiated).

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/page.tsx src/components/CheckoutForm.tsx
git commit -m "feat: checkout page with razorpay modal"
```

---

### Task 34: Order confirmation page

**Files:**
- Create: `src/app/orders/[razorpayOrderId]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { getRazorpay } from '@/lib/razorpay';
import { getProduct } from '@/data/products';

type OrderNotes = {
  receiptId?: string;
  cart?: string;
  shipping?: string;
};

type FetchedOrder = {
  id: string;
  amount: number;
  status: string;
  notes: OrderNotes;
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ razorpayOrderId: string }>;
}) {
  const { razorpayOrderId } = await params;

  let order: FetchedOrder;
  try {
    const rzp = getRazorpay();
    order = (await rzp.orders.fetch(razorpayOrderId)) as unknown as FetchedOrder;
  } catch {
    notFound();
  }

  const cart = JSON.parse(order.notes.cart ?? '[]') as Array<{
    slug: string;
    size: string;
    qty: number;
  }>;

  const lines = cart
    .map((entry) => {
      const product = getProduct(entry.slug);
      if (!product) return null;
      return {
        name: product.name,
        size: entry.size,
        qty: entry.qty,
        lineTotalInr: product.priceInr * entry.qty,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />

      <section className="px-7 py-16 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)] mb-3">
          Order Confirmed
        </div>
        <h1 className="font-display text-4xl tracking-tight">Thanks. We&apos;ve got it.</h1>
        <div className="font-mono text-xs text-[var(--color-muted-light)] mt-2">
          Receipt: {order.notes.receiptId ?? order.id}
        </div>

        <div className="border-t border-black/10 mt-10">
          {lines.map((l, i) => (
            <div
              key={`${l.name}-${l.size}-${i}`}
              className="flex justify-between border-b border-black/10 py-3 font-mono text-xs"
            >
              <span>
                {l.name} · {l.size} × {l.qty}
              </span>
              <span>₹ {l.lineTotalInr.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 font-mono text-sm">
          <span>Total paid</span>
          <span>₹ {(order.amount / 100).toLocaleString('en-IN')}</span>
        </div>

        <p className="mt-10 text-sm text-[var(--color-muted-light)] leading-relaxed">
          A confirmation has been emailed to you. We ship within 3 business days. Questions? Reply
          to the confirmation email or write to{' '}
          <a href="mailto:orders@bombastic.in" className="underline">
            orders@bombastic.in
          </a>
          .
        </p>

        <Link
          href="/shop"
          className="inline-block mt-10 px-6 py-3 bg-black text-[var(--color-bg-light)] font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Back to Shop →
        </Link>
      </section>

      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/orders/\[razorpayOrderId\]/page.tsx
git commit -m "feat: order confirmation page"
```

---

### Task 35: About page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

export default function AboutPage() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 py-16 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-dark)] mb-4">
          // BOMBASTIC
        </div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-8">
          Made in Delhi. Made to be worn.
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-dark)]/90">
          Bombastic is a small streetwear label. We print heavyweight cotton tees in limited runs, then
          we stop. No restocks, no bloat. Each drop is its own thing.
        </p>
        <p className="text-base leading-relaxed mt-6 text-[var(--color-text-dark)]/90">
          Want to say something?{' '}
          <a href="mailto:hello@bombastic.in" className="underline">
            hello@bombastic.in
          </a>
          .
        </p>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: about page"
```

---

### Task 36: Contact page

**Files:**
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'We ship within 3 business days. Delivery is typically 4–7 days across India.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Not yet. We ship within India only for Drop 01. International is coming.',
  },
  {
    q: 'How do returns work?',
    a: 'See our returns policy. Unworn items in original packaging can be exchanged within 7 days of delivery.',
  },
  {
    q: 'How do sizes run?',
    a: 'Oversized. Order your usual size for a relaxed fit; size down for closer to body.',
  },
];

export default function ContactPage() {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <section className="px-7 py-16 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">Help & contact.</h1>
        <p className="text-base mt-6 leading-relaxed">
          Email:{' '}
          <a href="mailto:hello@bombastic.in" className="underline">
            hello@bombastic.in
          </a>
          <br />
          Instagram:{' '}
          <a href="https://instagram.com/bombastic" className="underline" target="_blank">
            @bombastic
          </a>
        </p>

        <div className="mt-12 space-y-8">
          {faqs.map((f) => (
            <div key={f.q}>
              <div className="font-display text-lg">{f.q}</div>
              <div className="text-sm mt-1 text-[var(--color-muted-light)] leading-relaxed">
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: contact page with FAQ"
```

---

### Task 37: Policy pages (shipping, returns, privacy, terms)

**Files:**
- Create: `src/app/policies/shipping/page.tsx`
- Create: `src/app/policies/returns/page.tsx`
- Create: `src/app/policies/privacy/page.tsx`
- Create: `src/app/policies/terms/page.tsx`
- Create: `src/components/PolicyLayout.tsx`

- [ ] **Step 1: Create the shared layout `src/components/PolicyLayout.tsx`**

```tsx
import { Nav } from './Nav';
import { Footer } from './Footer';
import { SurfaceLayout } from './SurfaceLayout';

export function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <article className="px-7 py-16 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight mb-8">{title}</h1>
        <div className="space-y-6 text-sm leading-relaxed">{children}</div>
      </article>
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Create `src/app/policies/shipping/page.tsx`**

```tsx
import { PolicyLayout } from '@/components/PolicyLayout';

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping">
      <p>We ship within India. Orders placed before 4pm IST are dispatched within 3 business days.</p>
      <p>Delivery typically takes 4–7 business days depending on location.</p>
      <p>Shipping is ₹100 flat within India. Free shipping on orders over ₹2,500.</p>
      <p>You will receive a tracking link by email once your order is dispatched.</p>
    </PolicyLayout>
  );
}
```

- [ ] **Step 3: Create `src/app/policies/returns/page.tsx`**

```tsx
import { PolicyLayout } from '@/components/PolicyLayout';

export default function ReturnsPolicy() {
  return (
    <PolicyLayout title="Returns & exchanges">
      <p>Unworn, unwashed items in original packaging can be exchanged within 7 days of delivery.</p>
      <p>Exchanges are size-only — you can swap one size of the same product for another, subject to availability.</p>
      <p>To start an exchange, reply to your order confirmation email with your receipt number and the size you want.</p>
      <p>We do not offer returns for change of mind. We do offer full refunds for manufacturing defects.</p>
    </PolicyLayout>
  );
}
```

- [ ] **Step 4: Create `src/app/policies/privacy/page.tsx`**

```tsx
import { PolicyLayout } from '@/components/PolicyLayout';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy">
      <p>
        We collect only what we need to fulfill your order: name, address, phone, email, and the
        items you ordered.
      </p>
      <p>
        Payment information is handled entirely by Razorpay. We never see your card or UPI
        credentials.
      </p>
      <p>
        Your email is used only for order communication unless you explicitly opt in to drop
        announcements.
      </p>
      <p>
        Questions about your data? Email{' '}
        <a className="underline" href="mailto:hello@bombastic.in">
          hello@bombastic.in
        </a>
        .
      </p>
    </PolicyLayout>
  );
}
```

- [ ] **Step 5: Create `src/app/policies/terms/page.tsx`**

```tsx
import { PolicyLayout } from '@/components/PolicyLayout';

export default function TermsPolicy() {
  return (
    <PolicyLayout title="Terms">
      <p>By placing an order with Bombastic you agree to these terms.</p>
      <p>
        All prices are in INR and inclusive of applicable taxes. Shipping is charged separately
        where applicable.
      </p>
      <p>
        Items are sold while stocks last. If an item becomes unavailable after an order is placed,
        we will refund the affected line item in full.
      </p>
      <p>
        Disputes are subject to the jurisdiction of courts in Delhi, India.
      </p>
    </PolicyLayout>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/policies/ src/components/PolicyLayout.tsx
git commit -m "feat: shipping, returns, privacy, terms pages"
```

---

### Task 38: 404 page

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

export default function NotFound() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 py-32">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-dark)] mb-3">
          [ 404 / NOT_FOUND ]
        </div>
        <h1 className="font-display text-5xl">Nothing here.</h1>
        <Link
          href="/shop"
          className="inline-block mt-8 bg-[var(--color-text-dark)] text-[var(--color-bg-dark)] px-6 py-3 font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Back to Shop →
        </Link>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat: 404 page"
```

---

### Task 39: Add placeholder product images

**Files:**
- Create: 5 placeholder JPGs in `public/products/`

- [ ] **Step 1: Generate placeholder images**

Since we don't have real photography yet, write a tiny script to generate placeholder JPGs:

Create `scripts/generate-placeholders.mjs`:

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

mkdirSync('public/products', { recursive: true });

const placeholders = [
  'static-tee-black-1.jpg',
  'static-tee-black-2.jpg',
  'static-tee-bone-1.jpg',
  'static-tee-bone-2.jpg',
  'noise-tee-charcoal-1.jpg',
];

// Minimal valid 1x1 grey JPEG
const oneByOneGreyJpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
  0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
  0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
  0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
  0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00,
  0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
  0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
  0x82, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd3, 0xff, 0xd9,
]);

for (const name of placeholders) {
  writeFileSync(join('public/products', name), oneByOneGreyJpeg);
}

console.log(`Wrote ${placeholders.length} placeholder JPGs to public/products/`);
```

- [ ] **Step 2: Run it**

```bash
node scripts/generate-placeholders.mjs
```

Expected: `Wrote 5 placeholder JPGs to public/products/`

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-placeholders.mjs public/products/
git commit -m "chore: placeholder product images"
```

---

### Task 40: README / runbook for the brand owner

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: owner runbook"
```

---

### Task 41: Pre-launch verification

**Files:** none — verification task.

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass (smoke, cart-math, receipt, validation, razorpay-signature, checkout-api).

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: No build errors. Static pages for `/`, `/shop`, `/about`, `/contact`, `/policies/*`, `/shop/[slug]` for each seeded product, and `/not-found`.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 4: Manual checklist (with `npm run dev` running)**

Walk through each path. Mark each as PASS or note the issue.

1. `/` — dark home renders, brand mark visible, featured products show.
2. `/shop` — three products in grid.
3. `/shop/static-tee-black` — light surface, can pick a size, "Add to Cart" navigates to `/cart`.
4. `/cart` — item visible, qty +/- works, remove works.
5. Refresh `/cart` — cart persists.
6. `/checkout` (with cart items) — form renders, validation errors show inline on submit with bad data.
7. With valid Razorpay TEST keys in `.env.local`, submit checkout → Razorpay modal opens.
   - Use Razorpay test card `4111 1111 1111 1111`, any future expiry, any CVV.
   - Payment succeeds → redirect to `/orders/[id]` → confirmation visible.
   - Email arrives at customer + owner addresses (if Resend keys are real).
8. `/about` — dark.
9. `/contact` — light, FAQ visible.
10. `/policies/shipping` — renders.
11. Visit `/shop/does-not-exist` — 404 page renders.

- [ ] **Step 5: If everything passes, commit a tag**

```bash
git tag v0.1.0-prelaunch
```

(Tag is for your own reference; not pushed until you push the repo.)

---

## Self-review checklist (run after writing the plan above)

Already done during plan writing:

- ✅ Spec coverage:
  - Tech stack — Tasks 1, 2, 4, 5
  - Brand & visual system — Tasks 4, 5, 15, 16, 19
  - Pages (all 11 routes from spec) — Tasks 19, 21, 22, 23, 33, 34, 35, 36, 37, 38
  - Data model — Tasks 6, 7
  - Cart — Tasks 8, 9, 14, 23
  - Checkout flow (8 steps from spec) — Tasks 27, 28, 29, 32, 33
  - Order persistence (Razorpay notes) — Task 28 (`notes` payload) and Task 34 (reads notes)
  - Stock handling — Task 7 (catalog), Task 27 (test for oversell), Task 28 (server-side reject)
  - Error handling table — covered by Tasks 27 (out-of-stock 409), 31 (webhook signature reject + dedupe), 33 (cart preserved, conflict message), 31 (email failure logged)
  - Testing requirements — Tasks 8, 10, 12, 25, 27, 41
  - Upgrade paths — informational only, no implementation needed
- ✅ Placeholders: none — all code is complete.
- ✅ Type consistency: `Product`, `ProductSize`, `CartEntry`, `ShippingForm` all reused with the same shape across tasks.
- ✅ No "similar to Task N" references — code repeated where needed.

If you find a gap or inconsistency during execution, that's a plan bug — fix it in the plan first, then implement.
