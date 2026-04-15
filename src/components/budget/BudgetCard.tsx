import { Trash2 } from 'lucide-react';
import type { Budget, Transaction } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  budget: Budget;
  transactions: Transaction[];
  onDelete: (category: string) => void;
}

export function BudgetCard({ budget, transactions, onDelete }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const categories = useSettingsStore((s) => s.categories);
  const rates = { USD: 1, NGN: ngnPerUsd };

  const limitInDisplay = convert(budget.limit, budget.currency, displayCurrency, rates);
  const spent = transactions
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .reduce((sum, t) => sum + convert(t.amount, t.currency, displayCurrency, rates), 0);

  const pct = limitInDisplay > 0 ? (spent / limitInDisplay) * 100 : 0;
  const remaining = limitInDisplay - spent;
  const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'ok';
  const categoryName = categories.find(
    (c) => c.icon === budget.category && c.type === 'expense',
  )?.name;

  return (
    <div className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{budget.category}</span>
          <div>
            <div className="font-semibold text-[15px]">{categoryName ?? 'Category'}</div>
            <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
              {formatMoney(spent, displayCurrency)} of{' '}
              {formatMoney(limitInDisplay, displayCurrency)}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(budget.category)}
          aria-label="Delete budget"
          className="h-8 w-8 grid place-items-center rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[var(--color-red)]/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <ProgressBar value={pct} tone={tone} />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span
          className="font-semibold"
          style={{
            color:
              remaining >= 0 ? 'var(--color-green)' : 'var(--color-red)',
          }}
        >
          {remaining >= 0 ? 'Remaining' : 'Over'} {formatMoney(Math.abs(remaining), displayCurrency)}
        </span>
        <span className="text-[var(--color-text-2)] tabular-nums">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
