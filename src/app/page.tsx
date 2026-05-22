import Image from 'next/image';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { BrandMark } from '@/components/BrandMark';
import { products } from '@/data/products';

export default function HomePage() {
  const live = products.filter((p) => p.status === 'live');
  const hero = live[0];

  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />

      <section className="px-7 pt-12 pb-32">
        <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-4">
          [ DROP_01 / LIVE / {live.length} {live.length === 1 ? 'PIECE' : 'PIECES'} ]
        </div>

        <h1 className="text-[88px] md:text-[120px]">
          <BrandMark variant="hero" />
        </h1>

        <p className="mt-8 max-w-md font-mono text-xs leading-relaxed text-[var(--color-muted-dark)]">
          Heavyweight cotton. Small runs. Printed in Delhi. When it&apos;s gone it&apos;s gone.
        </p>

        <Link
          href="/shop"
          className="inline-block mt-10 bg-white text-black px-6 py-3 font-mono text-xs tracking-[0.25em] uppercase hover:bg-white/90"
        >
          Enter Store →
        </Link>
      </section>

      {hero && (
        <section className="px-7 pb-24">
          <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)] mb-6">
            {'// FEATURED'}
          </div>
          <Link
            href={`/shop/${hero.slug}`}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center group"
          >
            <div className="relative aspect-[3/4] bg-white/5 overflow-hidden">
              {hero.images[0] ? (
                <Image
                  src={hero.images[0]}
                  alt={hero.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted-dark)]">
                    {hero.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted-dark)] mb-4">
                [ NEW / {hero.dropId.toUpperCase().replace('-', '_')} ]
              </div>
              <h2 className="text-3xl md:text-5xl leading-tight mb-6">{hero.name}</h2>
              <p className="font-mono text-xs leading-relaxed text-[var(--color-muted-dark)] mb-8 max-w-md">
                {hero.description}
              </p>
              <div className="flex items-center gap-6">
                <span className="font-mono text-sm tracking-[0.15em]">
                  ₹ {hero.priceInr.toLocaleString('en-IN')}
                </span>
                <span className="inline-block bg-white text-black px-5 py-3 font-mono text-xs tracking-[0.25em] uppercase group-hover:bg-white/90">
                  Shop Now →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
