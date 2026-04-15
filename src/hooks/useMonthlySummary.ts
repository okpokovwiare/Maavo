import { useMemo } from 'react';
import type { Currency, Transaction } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { convert } from '@/lib/currency';
import { isInMonth } from '@/lib/date';

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  count: number;
  transactions: Transaction[];
}

export function useMonthlySummary(cursor: Date): MonthlySummary {
  const transactions = useTransactionStore((s) => s.transactions);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);

  return useMemo(() => {
    const rates: Record<Currency, number> = { USD: 1, NGN: ngnPerUsd };
    const monthly = transactions.filter((t) => isInMonth(t.date, cursor));

    let income = 0;
    let expenses = 0;
    for (const t of monthly) {
      const v = convert(t.amount, t.currency, displayCurrency, rates);
      if (t.type === 'income') income += v;
      else expenses += v;
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      count: monthly.length,
      transactions: monthly,
    };
  }, [transactions, displayCurrency, ngnPerUsd, cursor]);
}
