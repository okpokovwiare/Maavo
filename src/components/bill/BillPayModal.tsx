import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBillStore } from '@/stores/useBillStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney, parseAmount } from '@/lib/currency';
import { prettyDate } from '@/lib/date';

interface Props {
  billId: string | null;
  onClose: () => void;
}

export function BillPayModal({ billId, onClose }: Props) {
  const bills = useBillStore((s) => s.bills);
  const applyPayment = useBillStore((s) => s.applyPayment);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);

  const bill = useMemo(() => bills.find((b) => b.id === billId) ?? null, [bills, billId]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (billId) {
      setInput('');
      setError(null);
    }
  }, [billId]);

  if (!bill) return <Modal open={false} onClose={onClose}>{null}</Modal>;

  const remainingDisplay = convert(bill.amount, bill.currency, displayCurrency, {
    USD: 1,
    NGN: ngnPerUsd,
  });

  function submit() {
    if (!bill) return;
    const n = parseAmount(input);
    if (n === null || n <= 0) {
      setError('Enter a valid amount');
      return;
    }
    const inBillCurrency = convert(n, displayCurrency, bill.currency, {
      USD: 1,
      NGN: ngnPerUsd,
    });
    applyPayment(bill.id, inBillCurrency);
    onClose();
  }

  return (
    <Modal
      open={!!billId}
      onClose={onClose}
      title="Make payment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Pay</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] rounded-2xl p-4">
          <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
            Bill
          </div>
          <div className="font-display font-bold text-lg">{bill.name}</div>
          <div className="text-sm text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mt-1">
            Remaining:{' '}
            <span className="font-semibold text-[var(--color-text)] dark:text-[var(--color-text-dark)]">
              {formatMoney(remainingDisplay, displayCurrency)}
            </span>
          </div>
        </div>
        <Input
          autoFocus
          label="Payment amount"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          error={error ?? undefined}
        />
        {bill.payments.length > 0 && (
          <div>
            <div className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-2">
              Payment history
            </div>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {bill.payments
                .slice()
                .reverse()
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between text-sm py-1.5 px-3 rounded-lg bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]"
                  >
                    <span className="text-[var(--color-text-2)]">{prettyDate(p.date)}</span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(p.amount, bill.currency)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
