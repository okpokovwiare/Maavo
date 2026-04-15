import { CheckCircle2, RotateCcw, Trash2, Wallet } from 'lucide-react';
import type { Debt } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { prettyDate } from '@/lib/date';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

interface Props {
  debt: Debt;
  onPay: (id: string) => void;
  onToggleSettled: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DebtCard({ debt, onPay, onToggleSettled, onDelete }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const rates = { USD: 1, NGN: ngnPerUsd };
  const remaining = convert(debt.amount, debt.currency, displayCurrency, rates);
  const original = convert(debt.originalAmount, debt.currency, displayCurrency, rates);
  const paid = original - remaining;
  const pct = original > 0 ? Math.round((paid / original) * 100) : 0;

  const badge = debt.settled
    ? { text: '✓ SETTLED', cls: 'bg-[var(--color-green-soft)] text-[var(--color-green)]' }
    : debt.direction === 'owed'
      ? { text: 'I OWE', cls: 'bg-[var(--color-red)]/10 text-[var(--color-red)]' }
      : { text: 'LENT', cls: 'bg-[var(--color-blue)]/10 text-[var(--color-blue)]' };

  return (
    <div
      className={cn(
        'bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm flex flex-col gap-3',
        debt.settled && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px] truncate">{debt.person}</span>
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', badge.cls)}>
              {badge.text}
            </span>
          </div>
          {debt.description && (
            <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] truncate">
              {debt.description}
            </div>
          )}
          <div className="text-xs text-[var(--color-text-3)] mt-0.5">{prettyDate(debt.date)}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-[15px] tabular-nums">
            {formatMoney(remaining, displayCurrency)}
          </div>
          {original !== remaining && !debt.settled && (
            <div className="text-[11px] text-[var(--color-text-3)]">
              of {formatMoney(original, displayCurrency)}
            </div>
          )}
        </div>
      </div>

      {!debt.settled && original !== remaining && (
        <div>
          <ProgressBar value={pct} tone="info" />
          <div className="text-[11px] text-[var(--color-text-3)] mt-1">{pct}% paid</div>
        </div>
      )}

      <div className="flex gap-2">
        {!debt.settled && (
          <button
            onClick={() => onPay(debt.id)}
            className="flex-1 h-9 rounded-lg bg-[#6366f1] text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition"
          >
            <Wallet className="w-4 h-4" />
            Pay
          </button>
        )}
        <button
          onClick={() => onToggleSettled(debt.id)}
          className={cn(
            'h-9 px-3 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition',
            debt.settled
              ? 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] text-[var(--color-text)] dark:text-[var(--color-text-dark)]'
              : 'bg-[var(--color-green)] text-white hover:brightness-110',
          )}
        >
          {debt.settled ? (
            <>
              <RotateCcw className="w-4 h-4" />
              Unsettle
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Full
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(debt.id)}
          aria-label="Delete debt"
          className="h-9 w-9 grid place-items-center rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[var(--color-red)]/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
