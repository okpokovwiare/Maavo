import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { monthLabel } from '@/lib/date';
import { formatMoney, CURRENCY_SYMBOL } from '@/lib/currency';
import type { Currency } from '@/types';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { timeAgo } from '@/lib/exchange-rate';
import { cn } from '@/lib/cn';

interface Props {
  cursor: Date;
  onPrev: () => void;
  onNext: () => void;
  balance: number;
  income: number;
  expenses: number;
}

export function Header({ cursor, onPrev, onNext, balance, income, expenses }: Props) {
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const rateFetchedAt = useSettingsStore((s) => s.rateFetchedAt);

  return (
    <header className="px-5 pt-5 pb-6 safe-pt lg:px-6 lg:mb-6 bg-gradient-to-br from-[var(--color-green)] to-[#144e35] text-white rounded-b-[28px] lg:rounded-[24px]">
      <div className="flex items-center justify-between mb-5">
        <button
          aria-label="Previous month"
          onClick={onPrev}
          className="h-9 w-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-display text-lg font-bold tracking-tight">
          {monthLabel(cursor)}
        </div>
        <button
          aria-label="Next month"
          onClick={onNext}
          className="h-9 w-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 text-white/75 text-[11px] uppercase tracking-[0.14em] font-semibold">
        <span>Monthly balance</span>
        <div className="flex gap-1 bg-white/10 rounded-full p-0.5">
          {(['NGN', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-bold transition',
                displayCurrency === c
                  ? 'bg-white text-[var(--color-green)]'
                  : 'text-white/80',
              )}
            >
              {CURRENCY_SYMBOL[c]} {c}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={`${displayCurrency}-${balance.toFixed(2)}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="font-display font-bold text-4xl leading-none tracking-tight"
      >
        {formatMoney(balance, displayCurrency)}
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Income" value={formatMoney(income, displayCurrency)} tone="good" />
        <Stat label="Expenses" value={formatMoney(-expenses, displayCurrency)} tone="bad" />
      </div>

      <div className="mt-4 text-[11px] text-white/65">
        $1 = ₦{ngnPerUsd.toFixed(2)}
        {rateFetchedAt && <> · Updated {timeAgo(rateFetchedAt)}</>}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'bad';
}) {
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/70 font-semibold">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 font-semibold text-[17px]',
          tone === 'good' ? 'text-[#d1fae5]' : 'text-[#fecaca]',
        )}
      >
        {value}
      </div>
    </div>
  );
}
