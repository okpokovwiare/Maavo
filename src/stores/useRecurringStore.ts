import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recurring } from '@/types';
import { uuid } from '@/lib/id';

interface State {
  recurring: Recurring[];
  add: (r: Omit<Recurring, 'id' | 'createdAt'>) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Recurring>) => void;
  replaceAll: (list: Recurring[]) => void;
  clear: () => void;
}

export const useRecurringStore = create<State>()(
  persist(
    (set, get) => ({
      recurring: [],
      add: (r) =>
        set({
          recurring: [
            ...get().recurring,
            { ...r, id: uuid(), createdAt: new Date().toISOString() },
          ],
        }),
      remove: (id) => set({ recurring: get().recurring.filter((r) => r.id !== id) }),
      update: (id, patch) =>
        set({
          recurring: get().recurring.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        }),
      replaceAll: (list) => set({ recurring: list }),
      clear: () => set({ recurring: [] }),
    }),
    { name: 'bt:recurring:v1', version: 1 },
  ),
);
