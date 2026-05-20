import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

export default function NotFound() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 py-32">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-dark)] mb-3">
          [ 404 / NOT_FOUND ]
        </div>
        <h1 className="font-display text-5xl">Nothing here.</h1>
        <Link
          href="/shop"
          className="inline-block mt-8 bg-[var(--color-text-dark)] text-[var(--color-bg-dark)] px-6 py-3 font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Back to Shop →
        </Link>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
