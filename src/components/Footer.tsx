import Link from 'next/link';
import clsx from 'clsx';

type Props = { surface: 'dark' | 'light' };

export function Footer({ surface }: Props) {
  return (
    <footer
      className={clsx(
        'mt-32 border-t px-7 py-10 font-mono text-[10px] tracking-[0.2em] uppercase',
        surface === 'dark'
          ? 'border-white/10 text-[var(--color-muted-dark)]'
          : 'border-black/10 text-[var(--color-muted-light)]',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>© Bombastic — Drop 01</div>
        <div className="flex flex-wrap gap-6">
          <Link href="/policies/shipping">Shipping</Link>
          <Link href="/policies/returns">Returns</Link>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
