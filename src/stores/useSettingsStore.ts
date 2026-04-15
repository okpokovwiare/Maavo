import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CategoryDef, Currency } from '@/types';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import { DEFAULT_NGN_PER_USD } from '@/lib/exchange-rate';

interface State {
  displayCurrency: Currency;
  ngnPerUsd: number;
  rateFetchedAt?: string; // ISO
  categories: CategoryDef[];
  darkMode: boolean;
  setCurrency: (c: Currency) => void;
  setRate: (ngnPerUsd: number, fetchedAt?: string) => void;
  setDarkMode: (v: boolean) => void;
  addCategory: (c: CategoryDef) => void;
  removeCategory: (icon: string, type: CategoryDef['type']) => void;
  resetCategories: () => void;
  replaceCategories: (list: CategoryDef[]) => void;
}

export const useSettingsStore = create<State>()(
  persist(
    (set, get) => ({
      displayCurrency: 'NGN',
      ngnPerUsd: DEFAULT_NGN_PER_USD,
      categories: DEFAULT_CATEGORIES,
      darkMode: false,
      setCurrency: (c) => set({ displayCurrency: c }),
      setRate: (ngnPerUsd, fetchedAt) =>
        set({ ngnPerUsd, rateFetchedAt: fetchedAt ?? new Date().toISOString() }),
      setDarkMode: (v) => set({ darkMode: v }),
      addCategory: (c) => {
        const exists = get().categories.some(
          (x) => x.icon === c.icon && x.type === c.type,
        );
        if (exists) return;
        set({ categories: [...get().categories, c] });
      },
      removeCategory: (icon, type) =>
        set({
          categories: get().categories.filter(
            (c) => !(c.icon === icon && c.type === type),
          ),
        }),
      resetCategories: () => set({ categories: DEFAULT_CATEGORIES }),
      replaceCategories: (list) => set({ categories: list }),
    }),
    { name: 'bt:settings:v1', version: 1 },
  ),
);
