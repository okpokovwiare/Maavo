import { CheckCircle2, RotateCcw, Trash2, Wallet } from 'lucide-react';
import type { Bill } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { prettyDate, relativeDue } from '@/lib/date';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

interface Props {
  bill: Bill;
  onPay: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillCard({ bill, onPay, onTogglePaid, onDelete }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const rates = { USD: 1, NGN: ngnPerUsd };

  const remaining = convert(bill.amount, bill.currency, displayCurrency, rates);
  const original = convert(bill.originalAmount, bill.currency, displayCurrency, rates);
  const paid = original - remaining;
  const pct = original > 0 ? Math.round((paid / original) * 100) : 0;

  const due = bill.paid ? { kind: 'paid', label: `Paid · ${prettyDate(bill.dueDate)}` } : relativeDue(bill.dueDate);

  const badge = bill.paid
    ? { text: '✓ PAID', cls: 'bg-[var(--color-green-soft)] text-[var(--color-green)]' }
    : due.kind === 'overdue'
      ? { text: 'OVERDUE', cls: 'bg-[var(--color-red)]/10 text-[var(--color-red)]' }
      : due.kind === 'today' || due.kind === 'soon'
        ? { text: 'DUE SOON', cls: 'bg-[var(--color-warn)]/10 text-[var(--color-warn)]' }
        : null;

  return (
    <div
      className={cn(
        'bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm flex flex-col gap-3',
        bill.paid && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl grid place-items-center bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] text-xl">
          🧾
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px] truncate">{bill.name}</span>
            {badge && (
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', badge.cls)}>
                {badge.text}
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
            {due.label}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-[15px] tabular-nums">
            {formatMoney(remaining, displayCurrency)}
          </div>
          {original !== remaining && !bill.paid && (
            <div className="text-[11px] text-[var(--color-text-3)]">
              of {formatMoney(original, displayCurrency)}
            </div>
          )}
        </div>
      </div>

      {!bill.paid && original !== remaining && (
        <div>
          <ProgressBar value={pct} tone="info" />
          <div className="text-[11px] text-[var(--color-text-3)] mt-1">{pct}% paid</div>
        </div>
      )}

      <div className="flex gap-2">
        {!bill.paid && (
          <button
            onClick={() => onPay(bill.id)}
            className="flex-1 h-9 rounded-lg bg-[var(--color-amber)] text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition"
          >
            <Wallet className="w-4 h-4" />
            Pay
          </button>
        )}
        <button
          onClick={() => onTogglePaid(bill.id)}
          className={cn(
            'h-9 px-3 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition',
            bill.paid
              ? 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] text-[var(--color-text)] dark:text-[var(--color-text-dark)]'
              : 'bg-[var(--color-green)] text-white hover:brightness-110',
          )}
        >
          {bill.paid ? (
            <>
              <RotateCcw className="w-4 h-4" />
              Undo
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Full
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(bill.id)}
          aria-label="Delete bill"
          className="h-9 w-9 grid place-items-center rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[var(--color-red)]/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
