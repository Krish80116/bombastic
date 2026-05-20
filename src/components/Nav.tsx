import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { CartIcon } from './CartIcon';

type Props = { surface: 'dark' | 'light' };

export function Nav({ surface }: Props) {
  const brandColor = surface === 'dark' ? 'text-white' : 'text-black';
  const linkColor = surface === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black';

  return (
    <nav className="flex items-center justify-between px-7 py-6 font-mono text-xs tracking-[0.2em] uppercase">
      <Link href="/" className={brandColor}>
        <BrandMark variant="clean" />
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/shop" className={linkColor}>Shop</Link>
        <Link href="/about" className={linkColor}>About</Link>
        <CartIcon tone={surface} />
      </div>
    </nav>
  );
}
