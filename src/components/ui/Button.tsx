import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-green)] text-white hover:brightness-110 active:brightness-95 shadow-sm',
  secondary:
    'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] dark:bg-[var(--color-surface-2-dark)] dark:text-[var(--color-text-dark)] dark:hover:bg-[var(--color-border-dark)]',
  ghost:
    'bg-transparent text-[var(--color-text)] hover:bg-black/5 dark:text-[var(--color-text-dark)] dark:hover:bg-white/10',
  danger: 'bg-[var(--color-red)] text-white hover:brightness-110 active:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm h-9 px-3 rounded-lg',
  md: 'text-[15px] h-11 px-4 rounded-xl',
  lg: 'text-base h-12 px-5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  block,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
