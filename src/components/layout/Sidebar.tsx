import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutList,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/activity', label: 'Activity', icon: LayoutList },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const setDarkMode = useSettingsStore((s) => s.setDarkMode);

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col py-8 px-5 gap-6 sticky top-0 h-[100dvh] border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2">
        <div className="h-9 w-9 rounded-xl bg-[var(--color-green)] grid place-items-center text-white shadow-sm">
          <Wallet className="w-4.5 h-4.5" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-[17px]">Vault</div>
          <div className="text-[11px] text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
            Budget tracker
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Sections" className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 h-11 px-3 rounded-xl text-[14px] font-semibold transition-colors',
                isActive
                  ? 'bg-[var(--color-green)] text-white shadow-sm'
                  : 'text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-white dark:text-[var(--color-text-2-dark)] dark:hover:text-[var(--color-text-dark)] dark:hover:bg-[var(--color-surface-dark)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-4.5 h-4.5 transition-transform',
                    isActive ? '' : 'group-hover:scale-105',
                  )}
                  strokeWidth={isActive ? 2.2 : 2}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dark mode toggle */}
      <button
        onClick={() => {
          const next = !darkMode;
          setDarkMode(next);
          document.documentElement.classList.toggle('dark', next);
        }}
        className="flex items-center justify-between gap-2 h-11 px-3 rounded-xl text-[13px] font-medium text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-white dark:text-[var(--color-text-2-dark)] dark:hover:text-[var(--color-text-dark)] dark:hover:bg-[var(--color-surface-dark)] transition"
        aria-label="Toggle dark mode"
      >
        <span className="flex items-center gap-3">
          {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {darkMode ? 'Dark mode' : 'Light mode'}
        </span>
        <span
          className={cn(
            'relative h-5 w-9 rounded-full transition',
            darkMode ? 'bg-[var(--color-green)]' : 'bg-[var(--color-border)]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              darkMode && 'translate-x-4',
            )}
          />
        </span>
      </button>

      <div className="text-[11px] text-[var(--color-text-3)] px-3">v2 · local only</div>
    </aside>
  );
}
