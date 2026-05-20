import crypto from 'node:crypto';
import Razorpay from 'razorpay';

let cached: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cached) return cached;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error('Razorpay keys not configured');
  cached = new Razorpay({ key_id, key_secret });
  return cached;
}

type VerifyPaymentArgs = {
  orderId: string;
  paymentId: string;
  signature: string;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function verifyPaymentSignature(
  { orderId, paymentId, signature }: VerifyPaymentArgs,
  secret: string = process.env.RAZORPAY_KEY_SECRET ?? '',
): boolean {
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return timingSafeEqualHex(expected, signature);
}
