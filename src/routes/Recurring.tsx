import { useState } from 'react';
import { Repeat, Trash2 } from 'lucide-react';
import { useRecurringStore } from '@/stores/useRecurringStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { RecurringForm } from '@/components/recurring/RecurringForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';

interface Props {
  addOpen: boolean;
  onCloseAdd: () => void;
  onOpenAdd: () => void;
}

export function Recurring({ addOpen, onCloseAdd, onOpenAdd }: Props) {
  const recurring = useRecurringStore((s) => s.recurring);
  const remove = useRecurringStore((s) => s.remove);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const categories = useSettingsStore((s) => s.categories);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {recurring.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring items"
          hint="Set up rent, salary, subscriptions — they're logged automatically on the schedule you pick."
          action={<Button onClick={onOpenAdd}>Add recurring</Button>}
        />
      ) : (
        recurring.map((r) => {
          const amount = convert(r.amount, r.currency, displayCurrency, {
            USD: 1,
            NGN: ngnPerUsd,
          });
          const sign = r.type === 'income' ? '+' : '-';
          const catName = categories.find((c) => c.icon === r.category && c.type === r.type)?.name;
          return (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-3.5 shadow-sm"
            >
              <div className="h-11 w-11 rounded-xl grid place-items-center text-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]">
                {r.category}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{r.description}</div>
                <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] capitalize">
                  {r.frequency} · {catName ?? 'Category'}
                </div>
              </div>
              <div
                className={cn(
                  'font-semibold text-[15px] tabular-nums',
                  r.type === 'income' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]',
                )}
              >
                {sign}
                {formatMoney(amount, displayCurrency).replace('-', '')}
              </div>
              <button
                onClick={() => setPendingDelete(r.id)}
                aria-label="Delete recurring"
                className="h-8 w-8 grid place-items-center rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-red)] hover:bg-[var(--color-red)]/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })
      )}

      <RecurringForm open={addOpen} onClose={onCloseAdd} />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete recurring?"
        body="The rule stops — past materialized transactions stay on your ledger."
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
