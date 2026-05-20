import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';

type VerifyBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const ok = verifyPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });

  if (!ok) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true });
}
