import { NextResponse } from 'next/server';
import { getRazorpay, verifyWebhookSignature } from '@/lib/razorpay';
import { sendOrderEmails, type OrderEmailData } from '@/lib/email';
import { getProduct } from '@/data/products';

export const runtime = 'nodejs';

const processedPayments = new Set<string>();

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  let payload: {
    event: string;
    payload: { payment: { entity: { id: string; order_id: string; amount: number } } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, ignored: payload.event });
  }

  const payment = payload.payload.payment.entity;
  if (processedPayments.has(payment.id)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  processedPayments.add(payment.id);

  const rzp = getRazorpay();
  const order = (await rzp.orders.fetch(payment.order_id)) as unknown as {
    id: string;
    notes: { receiptId?: string; cart?: string; shipping?: string };
  };

  const cart = JSON.parse(order.notes.cart ?? '[]') as Array<{
    slug: string;
    size: string;
    qty: number;
  }>;
  const shipping = JSON.parse(order.notes.shipping ?? '{}') as OrderEmailData['customer'];

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

  try {
    await sendOrderEmails({
      receiptId: order.notes.receiptId ?? order.id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amountInPaise: payment.amount,
      customer: shipping,
      lines,
    });
  } catch (err) {
    console.error('email send failed', err);
  }

  return NextResponse.json({ ok: true });
}
