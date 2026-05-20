import { PolicyLayout } from '@/components/PolicyLayout';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy">
      <p>
        We collect only what we need to fulfill your order: name, address, phone, email, and the
        items you ordered.
      </p>
      <p>
        Payment information is handled entirely by Razorpay. We never see your card or UPI
        credentials.
      </p>
      <p>
        Your email is used only for order communication unless you explicitly opt in to drop
        announcements.
      </p>
      <p>
        Questions about your data? Email{' '}
        <a className="underline" href="mailto:hello@bombastic.in">
          hello@bombastic.in
        </a>
        .
      </p>
    </PolicyLayout>
  );
}
