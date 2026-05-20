'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function CartIcon({ tone }: { tone: 'dark' | 'light' }) {
  const { entries } = useCart();
  const count = entries.reduce((sum, e) => sum + e.qty, 0);
  return (
    <Link
      href="/cart"
      className={
        tone === 'dark'
          ? 'font-mono text-xs tracking-[0.2em] uppercase text-white/70 hover:text-white'
          : 'font-mono text-xs tracking-[0.2em] uppercase text-black/70 hover:text-black'
      }
    >
      Cart [{count}]
    </Link>
  );
}
