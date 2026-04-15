import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bill, Payment } from '@/types';
import { uuid } from '@/lib/id';
import { todayISO } from '@/lib/date';

interface State {
  bills: Bill[];
  add: (b: { name: string; amount: number; currency: Bill['currency']; dueDate: string }) => void;
  remove: (id: string) => void;
  togglePaid: (id: string) => void;
  applyPayment: (id: string, amount: number) => void;
  replaceAll: (list: Bill[]) => void;
  clear: () => void;
}

export const useBillStore = create<State>()(
  persist(
    (set, get) => ({
      bills: [],
      add: (b) =>
        set({
          bills: [
            ...get().bills,
            {
              id: uuid(),
              name: b.name,
              amount: b.amount,
              originalAmount: b.amount,
              currency: b.currency,
              dueDate: b.dueDate,
              paid: false,
              payments: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      remove: (id) => set({ bills: get().bills.filter((b) => b.id !== id) }),
      togglePaid: (id) =>
        set({
          bills: get().bills.map((b) =>
            b.id === id
              ? {
                  ...b,
                  paid: !b.paid,
                  amount: !b.paid ? 0 : b.originalAmount,
                  payments: !b.paid
                    ? [
                        ...b.payments,
                        { id: uuid(), amount: b.amount, date: todayISO() },
                      ]
                    : b.payments,
                }
              : b,
          ),
        }),
      applyPayment: (id, amount) =>
        set({
          bills: get().bills.map((b) => {
            if (b.id !== id) return b;
            const applied = Math.min(amount, b.amount);
            const remaining = Math.max(0, b.amount - applied);
            const payment: Payment = { id: uuid(), amount: applied, date: todayISO() };
            return {
              ...b,
              amount: remaining,
              paid: remaining === 0,
              payments: [...b.payments, payment],
            };
          }),
        }),
      replaceAll: (list) => set({ bills: list }),
      clear: () => set({ bills: [] }),
    }),
    { name: 'bt:bills:v1', version: 1 },
  ),
);
