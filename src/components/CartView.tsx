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
          className="inline-block mt-6 px-6 py-3 bg-black text-white font-mono text-xs tracking-[0.25em] uppercase hover:bg-black/90"
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
              <div className="font-display text-base">{l.name}</div>
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
        className="inline-block mt-6 px-8 py-4 bg-black text-white font-mono text-xs tracking-[0.25em] uppercase hover:bg-black/90"
      >
        Checkout →
      </Link>
    </div>
  );
}
