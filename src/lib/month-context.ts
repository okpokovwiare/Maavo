import { createContext, useContext } from 'react';

interface MonthContextValue {
  cursor: Date;
  prev: () => void;
  next: () => void;
}

export const MonthContext = createContext<MonthContextValue | null>(null);

export function useMonthContext(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonthContext must be used inside <AppShell>');
  return ctx;
}
