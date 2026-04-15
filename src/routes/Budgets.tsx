import { useState } from 'react';
import { Target } from 'lucide-react';
import { useBudgetStore } from '@/stores/useBudgetStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useMonthContext } from '@/lib/month-context';
import { isInMonth } from '@/lib/date';
import { BudgetCard } from '@/components/budget/BudgetCard';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Props {
  addOpen: boolean;
  onCloseAdd: () => void;
  onOpenAdd: () => void;
}

export function Budgets({ addOpen, onCloseAdd, onOpenAdd }: Props) {
  const budgets = useBudgetStore((s) => s.budgets);
  const removeBudget = useBudgetStore((s) => s.remove);
  const transactions = useTransactionStore((s) => s.transactions);
  const { cursor } = useMonthContext();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const monthly = transactions.filter((t) => isInMonth(t.date, cursor));

  return (
    <div className="flex flex-col gap-3">
      {budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets set"
          hint="Set a monthly limit per category and we'll track progress automatically."
          action={<Button onClick={onOpenAdd}>Add budget</Button>}
        />
      ) : (
        budgets.map((b) => (
          <BudgetCard
            key={b.category}
            budget={b}
            transactions={monthly}
            onDelete={setPendingDelete}
          />
        ))
      )}

      <BudgetForm open={addOpen} onClose={onCloseAdd} />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete budget?"
        body="The expenses themselves stay — only the limit is removed."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeBudget(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
