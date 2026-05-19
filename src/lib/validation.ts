export type ShippingForm = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

export type ValidationResult =
  | { ok: true; value: ShippingForm }
  | { ok: false; errors: Partial<Record<keyof ShippingForm, string>> };

const INDIAN_PHONE = /^[6-9]\d{9}$/;
const PINCODE = /^\d{6}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShipping(input: ShippingForm): ValidationResult {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};

  if (!input.fullName.trim()) errors.fullName = 'Required';
  if (!INDIAN_PHONE.test(input.phone)) errors.phone = '10-digit Indian mobile';
  if (!EMAIL.test(input.email)) errors.email = 'Valid email required';
  if (!input.addressLine1.trim()) errors.addressLine1 = 'Required';
  if (!input.city.trim()) errors.city = 'Required';
  if (!input.state.trim()) errors.state = 'Required';
  if (!PINCODE.test(input.pincode)) errors.pincode = '6 digits';

  if (Object.keys(errors).length === 0) return { ok: true, value: input };
  return { ok: false, errors };
}
