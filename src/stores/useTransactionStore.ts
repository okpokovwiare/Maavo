import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';
import { uuid } from '@/lib/id';

interface State {
  transactions: Transaction[];
  add: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
  update: (id: string, patch: Partial<Transaction>) => void;
  replaceAll: (txs: Transaction[]) => void;
  appendMany: (txs: Transaction[]) => void;
  clear: () => void;
}

export const useTransactionStore = create<State>()(
  persist(
    (set, get) => ({
      transactions: [],
      add: (tx) =>
        set({
          transactions: [
            {
              ...tx,
              id: uuid(),
              createdAt: new Date().toISOString(),
            },
            ...get().transactions,
          ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
        }),
      remove: (id) =>
        set({ transactions: get().transactions.filter((t) => t.id !== id) }),
      removeMany: (ids) => {
        const set2 = new Set(ids);
        set({ transactions: get().transactions.filter((t) => !set2.has(t.id)) });
      },
      update: (id, patch) =>
        set({
          transactions: get().transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        }),
      replaceAll: (txs) =>
        set({
          transactions: [...txs].sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
          ),
        }),
      appendMany: (txs) =>
        set({
          transactions: [...txs, ...get().transactions].sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
          ),
        }),
      clear: () => set({ transactions: [] }),
    }),
    { name: 'bt:transactions:v1', version: 1 },
  ),
);
