import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TxType } from '@/types';

export type TxFilter = 'all' | TxType;

interface Props {
  filter: TxFilter;
  search: string;
  onFilterChange: (f: TxFilter) => void;
  onSearchChange: (q: string) => void;
}

const FILTERS: Array<{ id: TxFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expenses' },
];

export function TransactionFilters({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transactions"
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[var(--color-surface-dark)] ring-1 ring-[var(--color-border)] dark:ring-[var(--color-border-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] text-[15px]"
        />
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-white dark:bg-[var(--color-surface-dark)] shadow-sm">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'flex-1 h-9 rounded-lg text-sm font-semibold transition',
              filter === f.id
                ? 'bg-[var(--color-green)] text-white'
                : 'text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
