import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { verifyPaymentSignature, verifyWebhookSignature } from '@/lib/razorpay';

describe('verifyPaymentSignature', () => {
  it('accepts a valid signature', () => {
    const secret = 'test_secret';
    const orderId = 'order_ABC';
    const paymentId = 'pay_XYZ';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    expect(verifyPaymentSignature({ orderId, paymentId, signature }, secret)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    expect(
      verifyPaymentSignature(
        { orderId: 'order_ABC', paymentId: 'pay_XYZ', signature: 'deadbeef' },
        'test_secret',
      ),
    ).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  it('accepts a valid webhook signature', () => {
    const secret = 'whsec_test';
    const body = '{"event":"payment.captured"}';
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it('rejects a forged webhook signature', () => {
    expect(
      verifyWebhookSignature('{"event":"payment.captured"}', 'forged', 'whsec_test'),
    ).toBe(false);
  });
});
