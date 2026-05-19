import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';

export default function ShopPage() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 pt-8 pb-24">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-6">
          [ DROP_01 / {products.length} PIECES ]
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
