import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDebtStore } from '@/stores/useDebtStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney, parseAmount } from '@/lib/currency';
import { prettyDate } from '@/lib/date';

interface Props {
  debtId: string | null;
  onClose: () => void;
}

export function DebtPayModal({ debtId, onClose }: Props) {
  const debts = useDebtStore((s) => s.debts);
  const applyPayment = useDebtStore((s) => s.applyPayment);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);

  const debt = useMemo(() => debts.find((d) => d.id === debtId) ?? null, [debts, debtId]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debtId) {
      setInput('');
      setError(null);
    }
  }, [debtId]);

  if (!debt) return <Modal open={false} onClose={onClose}>{null}</Modal>;

  const remainingDisplay = convert(debt.amount, debt.currency, displayCurrency, {
    USD: 1,
    NGN: ngnPerUsd,
  });

  function submit() {
    if (!debt) return;
    const n = parseAmount(input);
    if (n === null || n <= 0) {
      setError('Enter a valid amount');
      return;
    }
    const inDebtCurrency = convert(n, displayCurrency, debt.currency, {
      USD: 1,
      NGN: ngnPerUsd,
    });
    applyPayment(debt.id, inDebtCurrency);
    onClose();
  }

  return (
    <Modal
      open={!!debtId}
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
            {debt.direction === 'owed' ? 'I owe' : 'Owed to me'}
          </div>
          <div className="font-display font-bold text-lg">
            {debt.person}
            {debt.description ? ` — ${debt.description}` : ''}
          </div>
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
        {debt.payments.length > 0 && (
          <div>
            <div className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-2">
              Payment history
            </div>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {debt.payments
                .slice()
                .reverse()
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between text-sm py-1.5 px-3 rounded-lg bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]"
                  >
                    <span className="text-[var(--color-text-2)]">{prettyDate(p.date)}</span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(p.amount, debt.currency)}
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
