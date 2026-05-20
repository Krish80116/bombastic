import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { getRazorpay } from '@/lib/razorpay';
import { getProduct } from '@/data/products';

type OrderNotes = {
  receiptId?: string;
  cart?: string;
  shipping?: string;
};

type FetchedOrder = {
  id: string;
  amount: number;
  status: string;
  notes: OrderNotes;
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ razorpayOrderId: string }>;
}) {
  const { razorpayOrderId } = await params;

  let order: FetchedOrder;
  try {
    const rzp = getRazorpay();
    order = (await rzp.orders.fetch(razorpayOrderId)) as unknown as FetchedOrder;
  } catch {
    notFound();
  }

  const cart = JSON.parse(order.notes.cart ?? '[]') as Array<{
    slug: string;
    size: string;
    qty: number;
  }>;

  const lines = cart
    .map((entry) => {
      const product = getProduct(entry.slug);
      if (!product) return null;
      return {
        name: product.name,
        size: entry.size,
        qty: entry.qty,
        lineTotalInr: product.priceInr * entry.qty,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />

      <section className="px-7 py-16 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)] mb-3">
          Order Confirmed
        </div>
        <h1 className="font-display text-4xl tracking-tight">Thanks. We&apos;ve got it.</h1>
        <div className="font-mono text-xs text-[var(--color-muted-light)] mt-2">
          Receipt: {order.notes.receiptId ?? order.id}
        </div>

        <div className="border-t border-black/10 mt-10">
          {lines.map((l, i) => (
            <div
              key={`${l.name}-${l.size}-${i}`}
              className="flex justify-between border-b border-black/10 py-3 font-mono text-xs"
            >
              <span>
                {l.name} · {l.size} × {l.qty}
              </span>
              <span>₹ {l.lineTotalInr.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 font-mono text-sm">
          <span>Total paid</span>
          <span>₹ {(order.amount / 100).toLocaleString('en-IN')}</span>
        </div>

        <p className="mt-10 text-sm text-[var(--color-muted-light)] leading-relaxed">
          A confirmation has been emailed to you. We ship within 3 business days. Questions? Reply
          to the confirmation email or write to{' '}
          <a href="mailto:orders@bombastic.in" className="underline">
            orders@bombastic.in
          </a>
          .
        </p>

        <Link
          href="/shop"
          className="inline-block mt-10 px-6 py-3 bg-black text-white font-mono text-xs tracking-[0.25em] uppercase hover:bg-black/90"
        >
          Back to Shop →
        </Link>
      </section>

      <Footer surface="light" />
    </SurfaceLayout>
  );
}
