import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

export default function AboutPage() {
  return (
    <SurfaceLayout surface="dark">
      <Nav surface="dark" />
      <section className="px-7 py-16 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-dark)] mb-4">
          // BOMBASTIC
        </div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-8">
          Made in Delhi. Made to be worn.
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-dark)]/90">
          Bombastic is a small streetwear label. We print heavyweight cotton tees in limited runs, then
          we stop. No restocks, no bloat. Each drop is its own thing.
        </p>
        <p className="text-base leading-relaxed mt-6 text-[var(--color-text-dark)]/90">
          Want to say something?{' '}
          <a href="mailto:hello@bombastic.in" className="underline">
            hello@bombastic.in
          </a>
          .
        </p>
      </section>
      <Footer surface="dark" />
    </SurfaceLayout>
  );
}
