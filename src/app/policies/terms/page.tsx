import { PolicyLayout } from '@/components/PolicyLayout';

export default function TermsPolicy() {
  return (
    <PolicyLayout title="Terms">
      <p>By placing an order with Bombastic you agree to these terms.</p>
      <p>
        All prices are in INR and inclusive of applicable taxes. Shipping is charged separately
        where applicable.
      </p>
      <p>
        Items are sold while stocks last. If an item becomes unavailable after an order is placed,
        we will refund the affected line item in full.
      </p>
      <p>
        Disputes are subject to the jurisdiction of courts in Delhi, India.
      </p>
    </PolicyLayout>
  );
}
