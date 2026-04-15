import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, startOfMonth, subMonths } from 'date-fns';
import type { Transaction } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatCompactMoney, formatMoney } from '@/lib/currency';

interface Props {
  transactions: Transaction[];
  monthsBack?: number;
}

export function MonthComparison({ transactions, monthsBack = 5 }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);

  const data = useMemo(() => {
    const rates = { USD: 1, NGN: ngnPerUsd };
    const today = new Date();
    return Array.from({ length: monthsBack + 1 }).map((_, idx) => {
      const d = startOfMonth(subMonths(today, monthsBack - idx));
      const monthKey = format(d, 'yyyy-MM');
      let income = 0;
      let expenses = 0;
      for (const t of transactions) {
        if (!t.date.startsWith(monthKey)) continue;
        const v = convert(t.amount, t.currency, displayCurrency, rates);
        if (t.type === 'income') income += v;
        else expenses += v;
      }
      return { month: format(d, 'MMM'), income, expenses };
    });
  }, [transactions, displayCurrency, ngnPerUsd, monthsBack]);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-3)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="var(--color-text-3)"
            tickFormatter={(v: number) => formatCompactMoney(v, displayCurrency)}
            width={44}
          />
          <Tooltip
            formatter={(v: number) => formatMoney(v, displayCurrency)}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" fill="#1C6645" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" fill="#B4361F" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
