import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SurfaceLayout } from '@/components/SurfaceLayout';
import { CartView } from '@/components/CartView';

export default function CartPage() {
  return (
    <SurfaceLayout surface="light">
      <Nav surface="light" />
      <CartView />
      <Footer surface="light" />
    </SurfaceLayout>
  );
}
