import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useMonth } from '@/hooks/useMonth';
import { MonthContext } from '@/lib/month-context';

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { cursor, prev, next } = useMonth();

  return (
    <MonthContext.Provider value={{ cursor, prev, next }}>
      <div className="min-h-[100dvh] lg:flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="max-w-[480px] lg:max-w-[720px] mx-auto">
            <main>{children}</main>
          </div>
        </div>
      </div>
      <BottomNav />
    </MonthContext.Provider>
  );
}
