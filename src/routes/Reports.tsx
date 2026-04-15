import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useMonthContext } from '@/lib/month-context';
import { isInMonth } from '@/lib/date';
import { CategoryDonut } from '@/components/reports/CategoryDonut';
import { MonthComparison } from '@/components/reports/MonthComparison';
import { EmptyState } from '@/components/ui/EmptyState';

export function Reports() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { cursor } = useMonthContext();

  const monthly = useMemo(
    () => transactions.filter((t) => isInMonth(t.date, cursor)),
    [transactions, cursor],
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No data yet"
        hint="Log a few transactions to see spending breakdowns and month-over-month trends here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm">
        <h2 className="font-display text-base font-bold mb-2">Spending by category</h2>
        <CategoryDonut transactions={monthly} />
      </section>
      <section className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm">
        <h2 className="font-display text-base font-bold mb-2">Last 6 months</h2>
        <MonthComparison transactions={transactions} monthsBack={5} />
      </section>
    </div>
  );
}
