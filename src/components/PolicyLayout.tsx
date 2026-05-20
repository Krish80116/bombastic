import { Nav } from './Nav';
import { Footer } from './Footer';
import { SurfaceLayout } from './SurfaceLayout';

export function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <article className="px-7 py-16 max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight mb-8">{title}</h1>
        <div className="space-y-6 text-sm leading-relaxed">{children}</div>
      </article>
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
