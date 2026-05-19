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
