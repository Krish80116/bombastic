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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe rehydration: state must start empty on server, then sync from localStorage after mount
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
