import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Receipt } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TransactionCard } from '@/components/transaction/TransactionCard';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useMonthContext } from '@/lib/month-context';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useBudgetStore } from '@/stores/useBudgetStore';
import { useBillStore } from '@/stores/useBillStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { convert, formatMoney } from '@/lib/currency';
import { isInMonth } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Home() {
  const { cursor, prev, next } = useMonthContext();
  const { income, expenses, balance } = useMonthlySummary(cursor);
  const [addOpen, setAddOpen] = useState(false);

  const transactions = useTransactionStore((s) => s.transactions);
  const budgets = useBudgetStore((s) => s.budgets);
  const bills = useBillStore((s) => s.bills);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const ngnPerUsd = useSettingsStore((s) => s.ngnPerUsd);
  const categories = useSettingsStore((s) => s.categories);

  const rates = useMemo(() => ({ USD: 1, NGN: ngnPerUsd }), [ngnPerUsd]);

  const monthly = useMemo(
    () => transactions.filter((t) => isInMonth(t.date, cursor)),
    [transactions, cursor],
  );

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  const budgetRows = useMemo(
    () =>
      budgets
        .map((b) => {
          const limit = convert(b.limit, b.currency, displayCurrency, rates);
          const spent = monthly
            .filter((t) => t.type === 'expense' && t.category === b.category)
            .reduce((s, t) => s + convert(t.amount, t.currency, displayCurrency, rates), 0);
          const pct = limit > 0 ? (spent / limit) * 100 : 0;
          const catName = categories.find((c) => c.icon === b.category && c.type === 'expense')?.name;
          const tone: 'ok' | 'warn' | 'danger' = pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'ok';
          return { budget: b, spent, limit, pct, tone, catName };
        })
        .sort((a, b) => b.pct - a.pct),
    [budgets, monthly, displayCurrency, rates, categories],
  );

  const upcomingBills = useMemo(
    () =>
      [...bills]
        .filter((b) => !b.paid)
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
        .slice(0, 3),
    [bills],
  );

  return (
    <div className="flex flex-col">
      <Header
        cursor={cursor}
        onPrev={prev}
        onNext={next}
        income={income}
        expenses={expenses}
        balance={balance}
      />

      <div className="px-5 pt-5 flex flex-col gap-5 pb-28 lg:pb-12 lg:px-6 lg:pt-6">
        {/* Budget health */}
        <Section
          title="Budget health"
          link={{ to: '/activity?tab=budgets', label: 'All budgets' }}
        >
          {budgetRows.length === 0 ? (
            <p className="text-sm text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
              No budgets set.{' '}
              <Link to="/activity?tab=budgets" className="text-[var(--color-green)] font-semibold">
                Create one →
              </Link>
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {budgetRows.slice(0, 3).map(({ budget, spent, limit, pct, tone, catName }) => (
                <div key={budget.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{budget.category}</span>
                      <span className="text-sm font-semibold">{catName ?? 'Budget'}</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] tabular-nums">
                      {formatMoney(spent, displayCurrency)}{' '}
                      <span className="text-[var(--color-text-3)]">/ {formatMoney(limit, displayCurrency)}</span>
                    </span>
                  </div>
                  <ProgressBar value={pct} tone={tone} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Upcoming bills */}
        {bills.length > 0 && (
          <Section title="Upcoming bills" link={{ to: '/activity?tab=bills', label: 'View all' }}>
            {upcomingBills.length === 0 ? (
              <p className="text-sm text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
                All bills paid 🎉
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]">
                {upcomingBills.map((b) => {
                  const amount = convert(b.amount, b.currency, displayCurrency, rates);
                  const days = daysUntilDue(b.dueDate);
                  const dueLabel =
                    days < 0
                      ? `${Math.abs(days)}d overdue`
                      : days === 0
                        ? 'Due today'
                        : days === 1
                          ? 'Due tomorrow'
                          : `Due in ${days}d`;
                  return (
                    <div key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="h-9 w-9 rounded-xl grid place-items-center bg-[var(--color-amber)]/10 text-[var(--color-amber)] shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] truncate">{b.name}</div>
                        <div
                          className={cn(
                            'text-xs',
                            days < 0
                              ? 'text-[var(--color-red)]'
                              : days <= 3
                                ? 'text-[var(--color-amber)]'
                                : 'text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]',
                          )}
                        >
                          {dueLabel}
                        </div>
                      </div>
                      <div className="font-semibold text-[14px] tabular-nums shrink-0">
                        {formatMoney(amount, displayCurrency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* Recent activity */}
        <Section
          title="Recent activity"
          link={{ to: '/activity', label: 'View all' }}
          action={
            <button
              onClick={() => setAddOpen(true)}
              className="h-7 w-7 rounded-full bg-[var(--color-green)] text-white grid place-items-center hover:brightness-110 transition"
              aria-label="Add transaction"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          }
        >
          {recent.length === 0 ? (
            <p className="text-sm text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
              No transactions yet.{' '}
              <button
                onClick={() => setAddOpen(true)}
                className="text-[var(--color-green)] font-semibold"
              >
                Add one →
              </button>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </Section>
      </div>

      <TransactionForm open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function Section({
  title,
  children,
  link,
  action,
}: {
  title: string;
  children: ReactNode;
  link?: { to: string; label: string };
  action?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-[16px]">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {link && (
            <Link
              to={link.to}
              className="text-[12px] font-semibold text-[var(--color-green)] flex items-center gap-0.5"
            >
              {link.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function daysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
