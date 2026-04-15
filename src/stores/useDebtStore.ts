import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Debt, DebtDirection, Payment } from '@/types';
import { uuid } from '@/lib/id';
import { todayISO } from '@/lib/date';

interface State {
  debts: Debt[];
  add: (d: {
    direction: DebtDirection;
    person: string;
    amount: number;
    currency: Debt['currency'];
    description?: string;
    date: string;
  }) => void;
  remove: (id: string) => void;
  toggleSettled: (id: string) => void;
  applyPayment: (id: string, amount: number) => void;
  replaceAll: (list: Debt[]) => void;
  clear: () => void;
}

export const useDebtStore = create<State>()(
  persist(
    (set, get) => ({
      debts: [],
      add: (d) =>
        set({
          debts: [
            ...get().debts,
            {
              id: uuid(),
              direction: d.direction,
              person: d.person,
              amount: d.amount,
              originalAmount: d.amount,
              currency: d.currency,
              description: d.description,
              date: d.date,
              settled: false,
              payments: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      remove: (id) => set({ debts: get().debts.filter((d) => d.id !== id) }),
      toggleSettled: (id) =>
        set({
          debts: get().debts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  settled: !d.settled,
                  amount: !d.settled ? 0 : d.originalAmount,
                  payments: !d.settled
                    ? [
                        ...d.payments,
                        { id: uuid(), amount: d.amount, date: todayISO() },
                      ]
                    : d.payments,
                }
              : d,
          ),
        }),
      applyPayment: (id, amount) =>
        set({
          debts: get().debts.map((d) => {
            if (d.id !== id) return d;
            const applied = Math.min(amount, d.amount);
            const remaining = Math.max(0, d.amount - applied);
            const payment: Payment = { id: uuid(), amount: applied, date: todayISO() };
            return {
              ...d,
              amount: remaining,
              settled: remaining === 0,
              payments: [...d.payments, payment],
            };
          }),
        }),
      replaceAll: (list) => set({ debts: list }),
      clear: () => set({ debts: [] }),
    }),
    { name: 'bt:debts:v1', version: 1 },
  ),
);
