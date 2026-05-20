'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { computeCartTotals } from '@/lib/cart-math';
import { products } from '@/data/products';
import { validateShipping, type ShippingForm } from '@/lib/validation';
import type { RazorpayOptions } from './RazorpayScript';

const empty: ShippingForm = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

export function CheckoutForm() {
  const { entries, clear } = useCart();
  const router = useRouter();
  const totals = computeCartTotals(entries, products);

  const [form, setForm] = useState<ShippingForm>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function field<K extends keyof ShippingForm>(key: K) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value }),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = validateShipping(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cart: entries, shipping: form }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 409 && json.error === 'out_of_stock') {
          setError(`Size ${json.size} of ${json.slug} sold out. Update your cart to continue.`);
        } else {
          setError('Could not start checkout. Please try again.');
        }
        return;
      }

      const data = (await res.json()) as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Bombastic',
        description: 'Drop 01',
        order_id: data.razorpayOrderId,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: '#0a0a0a' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) {
            setError('Payment received but verification failed. Email orders@bombastic.in with this receipt.');
            return;
          }
          clear();
          router.push(`/orders/${response.razorpay_order_id}`);
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (totals.lines.length === 0) {
    return (
      <div className="px-7 py-24">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted-light)]">
          Cart is empty.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-7 py-12 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-12"
    >
      <div className="space-y-5">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)]">
          Shipping
        </div>

        <Input label="Full name" {...field('fullName')} err={errors.fullName} />
        <Input label="Email" type="email" {...field('email')} err={errors.email} />
        <Input label="Phone (10 digits)" {...field('phone')} err={errors.phone} />
        <Input label="Address line 1" {...field('addressLine1')} err={errors.addressLine1} />
        <Input label="Address line 2 (optional)" {...field('addressLine2')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" {...field('city')} err={errors.city} />
          <Input label="State" {...field('state')} err={errors.state} />
        </div>
        <Input label="Pincode" {...field('pincode')} err={errors.pincode} />
      </div>

      <aside className="border-l border-black/10 pl-8">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted-light)] mb-4">
          Summary
        </div>
        {totals.lines.map((l) => (
          <div key={`${l.slug}-${l.size}`} className="flex justify-between font-mono text-xs py-2">
            <span>
              {l.name} · {l.size} × {l.qty}
            </span>
            <span>₹ {l.lineTotalInr.toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className="flex justify-between font-mono text-sm mt-4 border-t border-black/10 pt-4">
          <span>Subtotal</span>
          <span>₹ {totals.subtotalInr.toLocaleString('en-IN')}</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--color-muted-light)] mt-2">
          Shipping calculated separately. We&apos;ll confirm after order placed.
        </div>

        {error && (
          <div className="mt-4 text-xs text-[var(--color-accent)] font-mono">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 px-8 py-4 bg-black text-white font-mono text-xs tracking-[0.25em] uppercase disabled:opacity-40 hover:bg-black/90"
        >
          {submitting ? 'Opening payment…' : 'Pay with Razorpay →'}
        </button>
      </aside>
    </form>
  );
}

function Input({
  label,
  err,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; err?: string }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted-light)] mb-1">
        {label}
      </span>
      <input
        {...props}
        className="w-full border-b border-black/30 py-2 bg-transparent focus:outline-none focus:border-black"
      />
      {err && <span className="block mt-1 text-[10px] font-mono text-[var(--color-accent)]">{err}</span>}
    </label>
  );
}
