import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  '#1C6645',
  '#1B3D6E',
  '#7A4A1E',
  '#3D2278',
  '#B4361F',
  '#B87911',
  '#0E7490',
  '#BE185D',
  '#4F46E5',
  '#047857',
];

export function CategoryDonut({ transactions }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const categories = useSettingsStore((s) => s.categories);

  const data = useMemo(() => {
    const rates = { USD: 1, NGN: ngnPerUsd };
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const v = convert(t.amount, t.currency, displayCurrency, rates);
      totals.set(t.category, (totals.get(t.category) ?? 0) + v);
    }
    return Array.from(totals.entries())
      .map(([icon, value]) => {
        const name = categories.find((c) => c.icon === icon && c.type === 'expense')?.name ?? icon;
        return { name: `${icon} ${name}`, value };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, displayCurrency, ngnPerUsd, categories]);

  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-[var(--color-text-2)] py-10">
        No expenses this month
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => formatMoney(v, displayCurrency)}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
