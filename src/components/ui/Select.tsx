import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, id, children, ...rest },
  ref,
) {
  const selectId = id ?? rest.name ?? undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center rounded-xl bg-white ring-1 ring-[var(--color-border)] focus-within:ring-2 focus-within:ring-[var(--color-green)]',
          'dark:bg-[var(--color-surface-2-dark)] dark:ring-[var(--color-border-dark)]',
          error && 'ring-[var(--color-red)]',
        )}
      >
        <select
          ref={ref}
          id={selectId}
          {...rest}
          className={cn(
            'appearance-none w-full bg-transparent px-3.5 pr-10 h-11 text-[15px] outline-none',
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 w-4 h-4 pointer-events-none text-[var(--color-text-2)]"
          aria-hidden
        />
      </div>
      {error && <span className="text-xs text-[var(--color-red)]">{error}</span>}
    </div>
  );
});
