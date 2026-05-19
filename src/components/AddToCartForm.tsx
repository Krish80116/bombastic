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
