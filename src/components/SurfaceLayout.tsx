import clsx from 'clsx';

type Props = {
  surface: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
};

export function SurfaceLayout({ surface, children, className }: Props) {
  const base =
    surface === 'dark'
      ? 'bg-[var(--color-bg-dark)] text-[var(--color-text-dark)]'
      : 'bg-[var(--color-bg-light)] text-[var(--color-text-light)]';
  return <div className={clsx('min-h-screen', base, className)}>{children}</div>;
}
