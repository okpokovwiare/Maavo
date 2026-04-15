import { useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';
import { useBillStore } from '@/stores/useBillStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { BillCard } from '@/components/bill/BillCard';
import { BillForm } from '@/components/bill/BillForm';
import { BillPayModal } from '@/components/bill/BillPayModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Props {
  addOpen: boolean;
  onCloseAdd: () => void;
  onOpenAdd: () => void;
}

export function Bills({ addOpen, onCloseAdd, onOpenAdd }: Props) {
  const bills = useBillStore((s) => s.bills);
  const togglePaid = useBillStore((s) => s.togglePaid);
  const removeBill = useBillStore((s) => s.remove);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...bills].sort((a, b) => {
        if (a.paid !== b.paid) return a.paid ? 1 : -1;
        return a.dueDate < b.dueDate ? -1 : 1;
      }),
    [bills],
  );

  const unpaidTotal = useMemo(() => {
    const rates = { USD: 1, NGN: ngnPerUsd };
    return bills
      .filter((b) => !b.paid)
      .reduce((s, b) => s + convert(b.amount, b.currency, displayCurrency, rates), 0);
  }, [bills, displayCurrency, ngnPerUsd]);

  const unpaidCount = bills.filter((b) => !b.paid).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-gradient-to-br from-[var(--color-amber)] to-[#5b380f] text-white rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-white/75">
          Unpaid total
        </div>
        <div className="font-display text-3xl font-bold mt-1 tabular-nums">
          {formatMoney(unpaidTotal, displayCurrency)}
        </div>
        <div className="text-xs text-white/75 mt-1">
          {unpaidCount} bill{unpaidCount !== 1 ? 's' : ''} pending
        </div>
      </div>

      {bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No upcoming bills"
          hint="Track rent, utilities, or anything you need to pay before a deadline."
          action={<Button onClick={onOpenAdd}>Add bill</Button>}
        />
      ) : (
        sorted.map((b) => (
          <BillCard
            key={b.id}
            bill={b}
            onPay={setPayingId}
            onTogglePaid={togglePaid}
            onDelete={setPendingDelete}
          />
        ))
      )}

      <BillForm open={addOpen} onClose={onCloseAdd} />
      <BillPayModal billId={payingId} onClose={() => setPayingId(null)} />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete bill?"
        body="Payment history on this bill is removed too."
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeBill(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
