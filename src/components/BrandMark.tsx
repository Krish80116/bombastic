import clsx from 'clsx';

type Props = {
  variant?: 'clean' | 'hero';
  className?: string;
};

export function BrandMark({ variant = 'clean', className }: Props) {
  if (variant === 'hero') {
    return (
      <span
        className={clsx(
          'font-display font-extrabold uppercase leading-[0.88] tracking-[-0.035em]',
          className,
        )}
      >
        Bomb/<br />astic<span className="text-[var(--color-accent)]">_</span>
      </span>
    );
  }
  return (
    <span className={clsx('font-display font-semibold tracking-tight', className)}>
      Bombastic<sup className="text-[0.5em] align-super">®</sup>
    </span>
  );
}
