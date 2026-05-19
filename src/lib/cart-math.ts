import type { Product, ProductSize } from '@/types/product';

export type CartEntry = {
  slug: string;
  size: ProductSize;
  qty: number;
};

export type CartLine = {
  slug: string;
  name: string;
  size: ProductSize;
  qty: number;
  unitPriceInr: number;
  lineTotalInr: number;
  primaryImage: string;
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
      name: product.name,
      size: entry.size,
      qty,
      unitPriceInr: product.priceInr,
      lineTotalInr: product.priceInr * qty,
      primaryImage: product.images[0],
    });
  }

  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotalInr = lines.reduce((sum, l) => sum + l.lineTotalInr, 0);

  return { lines, itemCount, subtotalInr };
}
