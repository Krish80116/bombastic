import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'We ship within 3 business days. Delivery is typically 4–7 days across India.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Not yet. We ship within India only for Drop 01. International is coming.',
  },
  {
    q: 'How do returns work?',
    a: 'See our returns policy. Unworn items in original packaging can be exchanged within 7 days of delivery.',
  },
  {
    q: 'How do sizes run?',
    a: 'Oversized. Order your usual size for a relaxed fit; size down for closer to body.',
  },
];

export default function ContactPage() {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <section className="px-7 py-16 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">Help & contact.</h1>
        <p className="text-base mt-6 leading-relaxed">
          Email:{' '}
          <a href="mailto:hello@bombastic.in" className="underline">
            hello@bombastic.in
          </a>
          <br />
          Instagram:{' '}
          <a href="https://instagram.com/bombastic" className="underline" target="_blank">
            @bombastic
          </a>
        </p>

        <div className="mt-12 space-y-8">
          {faqs.map((f) => (
            <div key={f.q}>
              <div className="font-display text-lg">{f.q}</div>
              <div className="text-sm mt-1 text-[var(--color-muted-light)] leading-relaxed">
                {f.a}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
