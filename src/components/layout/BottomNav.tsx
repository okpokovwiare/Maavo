import { NavLink } from 'react-router-dom';
import { Home, LayoutList, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/activity', label: 'Activity', icon: LayoutList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white/95 dark:bg-[var(--color-surface-dark)]/95 backdrop-blur-md"
    >
      <div className="flex h-16 safe-b">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-[var(--color-green)]'
                  : 'text-[var(--color-text-3)] hover:text-[var(--color-text-2)] dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-text-2-dark)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
