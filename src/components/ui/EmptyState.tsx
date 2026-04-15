import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, hint, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-4 rounded-3xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]',
        className,
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-[var(--color-surface-dark)] grid place-items-center shadow-sm">
        <Icon className="w-6 h-6 text-[var(--color-green)]" />
      </div>
      <h3 className="mt-4 font-display font-bold text-base">{title}</h3>
      {hint && (
        <p className="mt-1 text-sm text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] max-w-xs">
          {hint}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
