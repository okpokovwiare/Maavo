import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/budgets', label: 'Budgets' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/bills', label: 'Bills' },
  { to: '/debts', label: 'Debts' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export function TabBar() {
  return (
    <nav
      aria-label="Sections"
      className="lg:hidden sticky top-0 z-20 -mt-4 pt-4 pb-3 bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)]"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm font-semibold transition',
                isActive
                  ? 'bg-[var(--color-green)] text-white shadow-sm'
                  : 'bg-white dark:bg-[var(--color-surface-dark)] text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text-dark)]',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
