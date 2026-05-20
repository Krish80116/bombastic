import { NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';
import { computeCartTotals } from '@/lib/cart-math';
import { products, getProduct, getStock } from '@/data/products';
import { validateShipping, type ShippingForm } from '@/lib/validation';
import { generateReceiptId } from '@/lib/receipt';
import type { ProductSize } from '@/types/product';

type CheckoutRequestBody = {
  cart: Array<{ slug: string; size: ProductSize; qty: number }>;
  shipping: ShippingForm;
};

export async function POST(req: Request) {
  let body: CheckoutRequestBody;
  try {
    body = (await req.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const shippingResult = validateShipping(body.shipping ?? ({} as ShippingForm));
  if (!shippingResult.ok) {
    return NextResponse.json(
      { error: 'invalid_shipping', errors: shippingResult.errors },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.cart) || body.cart.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  for (const entry of body.cart) {
    const product = getProduct(entry.slug);
    if (!product) {
      return NextResponse.json(
        { error: 'unknown_product', slug: entry.slug },
        { status: 409 },
      );
    }
    const stock = getStock(product, entry.size);
    if (entry.qty <= 0 || entry.qty > stock) {
      return NextResponse.json(
        { error: 'out_of_stock', slug: entry.slug, size: entry.size, available: stock },
        { status: 409 },
      );
    }
  }

  const totals = computeCartTotals(
    body.cart.map((e) => ({ slug: e.slug, size: e.size, qty: e.qty })),
    products,
  );

  const amountInPaise = totals.subtotalInr * 100;
  const receiptId = generateReceiptId();

  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
    notes: {
      receiptId,
      shipping: JSON.stringify(shippingResult.value),
      cart: JSON.stringify(totals.lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty }))),
    },
  });

  return NextResponse.json({
    razorpayOrderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    receiptId,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
