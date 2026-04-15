import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useDebtStore } from '@/stores/useDebtStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { DebtCard } from '@/components/debt/DebtCard';
import { DebtForm } from '@/components/debt/DebtForm';
import { DebtPayModal } from '@/components/debt/DebtPayModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';

type DebtFilter = 'all' | 'owed' | 'lent' | 'settled';

interface Props {
  addOpen: boolean;
  onCloseAdd: () => void;
  onOpenAdd: () => void;
}

export function Debts({ addOpen, onCloseAdd, onOpenAdd }: Props) {
  const debts = useDebtStore((s) => s.debts);
  const toggleSettled = useDebtStore((s) => s.toggleSettled);
  const removeDebt = useDebtStore((s) => s.remove);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<DebtFilter>('all');

  const totals = useMemo(() => {
    const rates = { USD: 1, NGN: ngnPerUsd };
    const active = debts.filter((d) => !d.settled);
    return {
      owed: active
        .filter((d) => d.direction === 'owed')
        .reduce((s, d) => s + convert(d.amount, d.currency, displayCurrency, rates), 0),
      lent: active
        .filter((d) => d.direction === 'lent')
        .reduce((s, d) => s + convert(d.amount, d.currency, displayCurrency, rates), 0),
      owedCount: active.filter((d) => d.direction === 'owed').length,
      lentCount: active.filter((d) => d.direction === 'lent').length,
    };
  }, [debts, displayCurrency, ngnPerUsd]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'all':
        return debts;
      case 'owed':
        return debts.filter((d) => d.direction === 'owed' && !d.settled);
      case 'lent':
        return debts.filter((d) => d.direction === 'lent' && !d.settled);
      case 'settled':
        return debts.filter((d) => d.settled);
    }
  }, [debts, filter]);

  const FILTERS: Array<{ id: DebtFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'owed', label: 'I owe' },
    { id: 'lent', label: 'Lent' },
    { id: 'settled', label: 'Settled' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[var(--color-red)] to-[#7a2515] text-white rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/75">
            I owe
          </div>
          <div className="font-display text-xl font-bold mt-1 tabular-nums">
            {formatMoney(totals.owed, displayCurrency)}
          </div>
          <div className="text-[11px] text-white/75 mt-0.5">
            {totals.owedCount} debt{totals.owedCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[var(--color-blue)] to-[#132745] text-white rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-white/75">
            Lent out
          </div>
          <div className="font-display text-xl font-bold mt-1 tabular-nums">
            {formatMoney(totals.lent, displayCurrency)}
          </div>
          <div className="text-[11px] text-white/75 mt-0.5">
            {totals.lentCount} debt{totals.lentCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white dark:bg-[var(--color-surface-dark)] shadow-sm">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'flex-1 h-9 rounded-lg text-sm font-semibold transition',
              filter === f.id
                ? 'bg-[var(--color-green)] text-white'
                : 'text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={debts.length === 0 ? 'No debts yet' : 'Nothing here'}
          hint={
            debts.length === 0
              ? 'Track money you owe or money owed to you.'
              : 'Try another filter.'
          }
          action={
            debts.length === 0 && <Button onClick={onOpenAdd}>Add debt</Button>
          }
        />
      ) : (
        filtered.map((d) => (
          <DebtCard
            key={d.id}
            debt={d}
            onPay={setPayingId}
            onToggleSettled={toggleSettled}
            onDelete={setPendingDelete}
          />
        ))
      )}

      <DebtForm open={addOpen} onClose={onCloseAdd} />
      <DebtPayModal debtId={payingId} onClose={() => setPayingId(null)} />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete debt?"
        body="Payment history on this debt is removed too."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeDebt(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
