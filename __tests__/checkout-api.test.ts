import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/razorpay', () => {
  return {
    getRazorpay: () => ({
      orders: {
        create: vi.fn(async (opts: { amount: number }) => ({
          id: 'order_TEST',
          amount: opts.amount,
          currency: 'INR',
          status: 'created',
          notes: {},
        })),
      },
    }),
  };
});

import { POST } from '@/app/api/checkout/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validShipping = {
  fullName: 'Test User',
  phone: '9876543210',
  email: 'test@example.com',
  addressLine1: '1 Street',
  addressLine2: '',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid shipping', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 1 }],
        shipping: { ...validShipping, pincode: '00' },
      }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects empty cart', async () => {
    const res = await POST(
      makeRequest({ cart: [], shipping: validShipping }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects out-of-stock qty', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 9999 }],
        shipping: validShipping,
      }),
    );
    expect(res.status).toBe(409);
  });

  it('uses server-side price even if client tries to inject one', async () => {
    const res = await POST(
      makeRequest({
        cart: [{ slug: 'static-tee-black', size: 'M', qty: 1, priceInr: 1 }],
        shipping: validShipping,
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.amount).toBe(149900);
  });
});
