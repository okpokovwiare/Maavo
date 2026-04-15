import { useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useMonthContext } from '@/lib/month-context';
import { isInMonth } from '@/lib/date';
import { TransactionFilters, type TxFilter } from '@/components/transaction/TransactionFilters';
import { TransactionList } from '@/components/transaction/TransactionList';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { findCategoryName } from '@/lib/categories';
import { formatMoney } from '@/lib/currency';

interface Props {
  addOpen: boolean;
  onCloseAdd: () => void;
  onOpenAdd: () => void;
}

export function Overview({ addOpen, onCloseAdd, onOpenAdd }: Props) {
  const transactions = useTransactionStore((s) => s.transactions);
  const remove = useTransactionStore((s) => s.remove);
  const categories = useSettingsStore((s) => s.categories);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const { cursor } = useMonthContext();

  const [filter, setFilter] = useState<TxFilter>('all');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const monthly = useMemo(
    () => transactions.filter((t) => isInMonth(t.date, cursor)),
    [transactions, cursor],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthly.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (!q) return true;
      const catName = findCategoryName(categories, t.category, t.type) ?? '';
      return (
        t.description.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        t.category.includes(q)
      );
    });
  }, [monthly, filter, search, categories]);

  const avgDaily = useMemo(() => {
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const expenses = monthly
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return expenses / Math.max(1, last);
  }, [monthly, cursor]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
            Avg daily
          </div>
          <div className="font-display text-lg font-bold mt-1 tabular-nums">
            {formatMoney(avgDaily, displayCurrency)}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
            Transactions
          </div>
          <div className="font-display text-lg font-bold mt-1 tabular-nums">
            {monthly.length}
          </div>
        </div>
      </div>

      <TransactionFilters
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={monthly.length === 0 ? 'No transactions yet' : 'Nothing matches'}
          hint={
            monthly.length === 0
              ? 'Tap the + button to log your first one for this month.'
              : 'Try a different search or filter.'
          }
          action={
            monthly.length === 0 && (
              <Button onClick={onOpenAdd}>Add transaction</Button>
            )
          }
        />
      ) : (
        <TransactionList transactions={filtered} onDelete={setPendingDelete} />
      )}

      <TransactionForm open={addOpen} onClose={onCloseAdd} />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete transaction?"
        body="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
