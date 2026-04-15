import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Receipt, Repeat, Target, Users, Wallet } from 'lucide-react';
import { Overview } from './Overview';
import { Budgets } from './Budgets';
import { Recurring } from './Recurring';
import { Bills } from './Bills';
import { Debts } from './Debts';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

const VALID_TABS = ['transactions', 'budgets', 'recurring', 'bills', 'debts'] as const;
type Tab = (typeof VALID_TABS)[number];

interface TabDef {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const TABS: TabDef[] = [
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'debts', label: 'Debts', icon: Users },
];

function isValidTab(s: string | null): s is Tab {
  return VALID_TABS.includes(s as Tab);
}

export function Activity() {
  const [searchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(isValidTab(paramTab) ? paramTab : 'transactions');

  const [txOpen, setTxOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);

  function openAdd() {
    switch (tab) {
      case 'transactions': setTxOpen(true); break;
      case 'budgets': setBudgetOpen(true); break;
      case 'recurring': setRecurringOpen(true); break;
      case 'bills': setBillOpen(true); break;
      case 'debts': setDebtOpen(true); break;
    }
  }

  function addLabel() {
    switch (tab) {
      case 'transactions': return 'Add transaction';
      case 'budgets': return 'Add budget';
      case 'recurring': return 'Add recurring';
      case 'bills': return 'Add bill';
      case 'debts': return 'Add debt';
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Page header — sticky so tabs stay on screen while scrolling */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)]">
        {/* Title row */}
        <div className="flex items-center justify-between px-5 pt-6 pb-3 lg:px-6">
          <h1 className="font-display font-bold text-2xl">Activity</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--color-green)] text-white text-sm font-semibold hover:brightness-110 active:scale-95 transition"
            aria-label={addLabel()}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 lg:px-6 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'whitespace-nowrap flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold transition shrink-0',
                tab === t.id
                  ? 'bg-[var(--color-green)] text-white shadow-sm'
                  : 'bg-white dark:bg-[var(--color-surface-dark)] text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text-dark)]',
              )}
            >
              <t.icon className="w-3.5 h-3.5" strokeWidth={tab === t.id ? 2.2 : 2} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 lg:px-6 pt-3 pb-28 lg:pb-12">
        {tab === 'transactions' && (
          <Overview
            addOpen={txOpen}
            onCloseAdd={() => setTxOpen(false)}
            onOpenAdd={() => setTxOpen(true)}
          />
        )}
        {tab === 'budgets' && (
          <Budgets
            addOpen={budgetOpen}
            onCloseAdd={() => setBudgetOpen(false)}
            onOpenAdd={() => setBudgetOpen(true)}
          />
        )}
        {tab === 'recurring' && (
          <Recurring
            addOpen={recurringOpen}
            onCloseAdd={() => setRecurringOpen(false)}
            onOpenAdd={() => setRecurringOpen(true)}
          />
        )}
        {tab === 'bills' && (
          <Bills
            addOpen={billOpen}
            onCloseAdd={() => setBillOpen(false)}
            onOpenAdd={() => setBillOpen(true)}
          />
        )}
        {tab === 'debts' && (
          <Debts
            addOpen={debtOpen}
            onCloseAdd={() => setDebtOpen(false)}
            onOpenAdd={() => setDebtOpen(true)}
          />
        )}
      </div>
    </div>
  );
}
