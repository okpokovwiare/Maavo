import { Trash2, Repeat } from 'lucide-react';
import type { Transaction } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { prettyDate } from '@/lib/date';
import { cn } from '@/lib/cn';

interface Props {
  tx: Transaction;
  onDelete?: (id: string) => void;
}

export function TransactionCard({ tx, onDelete }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const categories = useSettingsStore((s) => s.categories);

  const converted = convert(tx.amount, tx.currency, displayCurrency, {
    USD: 1,
    NGN: ngnPerUsd,
  });
  const sign = tx.type === 'income' ? '+' : '-';
  const categoryName = categories.find(
    (c) => c.icon === tx.category && c.type === tx.type,
  )?.name;

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-3.5 shadow-sm">
      <div
        className={cn(
          'h-11 w-11 rounded-xl grid place-items-center text-xl shrink-0',
          tx.type === 'income'
            ? 'bg-[var(--color-green-soft)]'
            : 'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]',
        )}
        aria-label={categoryName ?? 'Category'}
      >
        {tx.category}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="font-semibold text-[15px] truncate">{tx.description}</div>
          {tx.isRecurring && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-purple)]/10 text-[var(--color-purple)] flex items-center gap-0.5"
              title="Recurring"
            >
              <Repeat className="w-2.5 h-2.5" />
              RECURRING
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
          {categoryName ? `${categoryName} · ` : ''}
          {prettyDate(tx.date)}
        </div>
      </div>
      <div
        className={cn(
          'font-semibold text-[15px] tabular-nums whitespace-nowrap',
          tx.type === 'income'
            ? 'text-[var(--color-green)]'
            : 'text-[var(--color-red)]',
        )}
      >
        {sign}
        {formatMoney(converted, displayCurrency).replace('-', '')}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(tx.id)}
          aria-label="Delete transaction"
          className="h-8 w-8 grid place-items-center rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[var(--color-red)]/10 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
