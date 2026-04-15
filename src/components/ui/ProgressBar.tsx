import { cn } from '@/lib/cn';

type Tone = 'ok' | 'warn' | 'danger' | 'info';

const TONE_CLASSES: Record<Tone, string> = {
  ok: 'bg-[var(--color-green)]',
  warn: 'bg-[var(--color-warn)]',
  danger: 'bg-[var(--color-red)]',
  info: 'bg-[var(--color-blue)]',
};

interface Props {
  value: number; // 0..100
  tone?: Tone;
  className?: string;
}

export function ProgressBar({ value, tone = 'ok', className }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        'h-1.5 w-full rounded-full overflow-hidden bg-[var(--color-bg-soft)] dark:bg-[var(--color-border-dark)]',
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', TONE_CLASSES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
