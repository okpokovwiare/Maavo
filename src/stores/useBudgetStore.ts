import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Budget } from '@/types';

interface State {
  budgets: Budget[];
  upsert: (budget: Budget) => void;
  remove: (category: string) => void;
  replaceAll: (budgets: Budget[]) => void;
  clear: () => void;
}

export const useBudgetStore = create<State>()(
  persist(
    (set, get) => ({
      budgets: [],
      upsert: (b) => {
        const existing = get().budgets.filter((x) => x.category !== b.category);
        set({ budgets: [...existing, b] });
      },
      remove: (category) =>
        set({ budgets: get().budgets.filter((b) => b.category !== category) }),
      replaceAll: (budgets) => set({ budgets }),
      clear: () => set({ budgets: [] }),
    }),
    { name: 'bt:budgets:v1', version: 1 },
  ),
);
