import { useMemo } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { TxType } from '@/types';
import { cn } from '@/lib/cn';

interface Props {
  type: TxType;
  selected?: string;
  onSelect: (icon: string) => void;
}

export function CategoryPicker({ type, selected, onSelect }: Props) {
  const categories = useSettingsStore((s) => s.categories);
  const filtered = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );
  const selectedName = filtered.find((c) => c.icon === selected)?.name;

  return (
    <div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {filtered.map((c) => {
          const isActive = c.icon === selected;
          return (
            <button
              key={`${c.icon}-${c.name}`}
              type="button"
              onClick={() => onSelect(c.icon)}
              aria-label={c.name}
              className={cn(
                'aspect-square rounded-2xl text-2xl grid place-items-center transition-all',
                'bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]',
                'hover:scale-[1.04]',
                isActive &&
                  'ring-2 ring-[var(--color-green)] bg-[var(--color-green-soft)]',
              )}
            >
              {c.icon}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-sm text-[var(--color-green)] font-semibold min-h-5">
        {selectedName}
      </div>
    </div>
  );
}
