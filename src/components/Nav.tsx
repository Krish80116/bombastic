import Link from 'next/link';
import clsx from 'clsx';
import { BrandMark } from './BrandMark';
import { CartIcon } from './CartIcon';

type Props = { surface: 'dark' | 'light' };

export function Nav({ surface }: Props) {
  const brandColor =
    surface === 'dark' ? 'text-[var(--color-text-dark)]' : 'text-[var(--color-text-light)]';
  const linksColor =
    surface === 'dark' ? 'text-[var(--color-muted-dark)]' : 'text-[var(--color-muted-light)]';

  return (
    <nav
      className={clsx(
        'flex items-center justify-between px-7 py-6 font-mono text-[10px] tracking-[0.2em] uppercase',
        linksColor,
      )}
    >
      <Link href="/" className={brandColor}>
        <BrandMark variant="clean" />
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
        <CartIcon tone={surface} />
      </div>
    </nav>
  );
}
