import { describe, it, expect } from 'vitest';
import { validateShipping, type ShippingForm } from '@/lib/validation';

const valid: ShippingForm = {
  fullName: 'Test User',
  phone: '9876543210',
  email: 'test@example.com',
  addressLine1: '123 Some Street',
  addressLine2: '',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
};

describe('validateShipping', () => {
  it('accepts a valid form', () => {
    const result = validateShipping(valid);
    expect(result.ok).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = validateShipping({ ...valid, fullName: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.fullName).toBeDefined();
  });

  it('rejects an invalid Indian phone', () => {
    const result = validateShipping({ ...valid, phone: '12345' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeDefined();
  });

  it('rejects an invalid pincode', () => {
    const result = validateShipping({ ...valid, pincode: '12' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.pincode).toBeDefined();
  });

  it('rejects a malformed email', () => {
    const result = validateShipping({ ...valid, email: 'notanemail' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });
});
