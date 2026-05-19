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
