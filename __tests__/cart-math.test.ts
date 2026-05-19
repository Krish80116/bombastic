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
