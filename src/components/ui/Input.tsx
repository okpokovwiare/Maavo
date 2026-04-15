import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leftAddon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-stretch rounded-xl bg-white ring-1 ring-[var(--color-border)] focus-within:ring-2 focus-within:ring-[var(--color-green)]',
          'dark:bg-[var(--color-surface-2-dark)] dark:ring-[var(--color-border-dark)]',
          error && 'ring-[var(--color-red)]',
        )}
      >
        {leftAddon && (
          <span className="px-3 flex items-center text-[var(--color-text-2)] border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] whitespace-nowrap text-sm shrink-0">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          {...rest}
          className={cn(
            'flex-1 bg-transparent px-3.5 h-11 text-[15px] outline-none placeholder:text-[var(--color-text-3)]',
            className,
          )}
        />
      </div>
      {(error || hint) && (
        <span
          className={cn(
            'text-xs',
            error
              ? 'text-[var(--color-red)]'
              : 'text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]',
          )}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
});
