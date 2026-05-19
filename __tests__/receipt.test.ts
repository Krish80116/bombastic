import { describe, it, expect } from 'vitest';
import { generateReceiptId } from '@/lib/receipt';

describe('generateReceiptId', () => {
  it('starts with BMB-', () => {
    expect(generateReceiptId()).toMatch(/^BMB-/);
  });

  it('is unique across rapid calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateReceiptId()));
    expect(ids.size).toBe(100);
  });

  it('fits within Razorpay receipt length (40 chars)', () => {
    expect(generateReceiptId().length).toBeLessThanOrEqual(40);
  });
});
