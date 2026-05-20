import { PolicyLayout } from '@/components/PolicyLayout';

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping">
      <p>We ship within India. Orders placed before 4pm IST are dispatched within 3 business days.</p>
      <p>Delivery typically takes 4–7 business days depending on location.</p>
      <p>Shipping is ₹100 flat within India. Free shipping on orders over ₹2,500.</p>
      <p>You will receive a tracking link by email once your order is dispatched.</p>
    </PolicyLayout>
  );
}
