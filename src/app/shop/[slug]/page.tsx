import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { AddToCartForm } from '@/components/AddToCartForm';
import { getProduct, products } from '@/data/products';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />

      <section className="px-7 pt-8 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[3/4] bg-black/5 flex items-center justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-light)]">
              {product.name}
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-light)] mb-2">
            {`// ${product.dropId.toUpperCase()}`}
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">{product.name}</h1>
          <div className="font-mono text-sm mt-2">₹ {product.priceInr.toLocaleString('en-IN')}</div>

          <p className="mt-6 max-w-md text-sm leading-relaxed">{product.description}</p>

          <div className="mt-6 font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted-light)]">
            {product.materials}
          </div>

          <AddToCartForm product={product} />
        </div>
      </section>

      <Footer surface="light" />
    </SurfaceLayout>
  );
}
