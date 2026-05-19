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
