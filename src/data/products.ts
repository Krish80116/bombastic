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
