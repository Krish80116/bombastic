import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { BrandMark } from '@/components/BrandMark';
import { products } from '@/data/products';

export default function HomePage() {
  const featured = products.filter((p) => p.status === 'live').slice(0, 3);

  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />

      <section className="px-7 pt-12 pb-32">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-4">
          [ DROP_01 / LIVE / {products.filter((p) => p.dropId === 'drop-01').length} PIECES ]
        </div>

        <h1 className="text-[88px] md:text-[120px]">
          <BrandMark variant="hero" />
        </h1>

        <p className="mt-8 max-w-md font-mono text-xs leading-relaxed text-[var(--color-muted-dark)]">
          Heavyweight cotton. Small runs. Printed in Delhi. When it&apos;s gone it&apos;s gone.
        </p>

        <Link
          href="/shop"
          className="inline-block mt-10 bg-[var(--color-text-dark)] text-[var(--color-bg-dark)] px-6 py-3 font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Enter Store →
        </Link>
      </section>

      <section className="px-7 pb-24">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)] mb-6">
          {'// FEATURED'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="block">
              <div className="aspect-[3/4] bg-white/5 mb-3 flex items-center justify-center">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)]">
                  {p.name}
                </span>
              </div>
              <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] uppercase">
                <span>{p.name}</span>
                <span>₹ {p.priceInr.toLocaleString('en-IN')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
