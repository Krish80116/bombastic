import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { CheckoutForm } from '@/components/CheckoutForm';
import { RazorpayScript } from '@/components/RazorpayScript';

export default function CheckoutPage() {
  return (
    <SurfaceLayout surface="light">
      <RazorpayScript />
      <Nav surface="light" />
      <CheckoutForm />
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
