import { useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Download,
  Moon,
  RefreshCw,
  Sun,
  Trash2,
  Upload,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useBudgetStore } from '@/stores/useBudgetStore';
import { useRecurringStore } from '@/stores/useRecurringStore';
import { useBillStore } from '@/stores/useBillStore';
import { useDebtStore } from '@/stores/useDebtStore';
import { useMonthContext } from '@/lib/month-context';
import { isInMonth } from '@/lib/date';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryDonut } from '@/components/reports/CategoryDonut';
import { MonthComparison } from '@/components/reports/MonthComparison';
import { fetchUsdToNgn, timeAgo } from '@/lib/exchange-rate';
import { normalizeImport } from '@/lib/legacy-import';
import type { CategoryDef, TxType } from '@/types';
import { cn } from '@/lib/cn';

export function Settings() {
  const {
    displayCurrency,
    setCurrency,
    ngnPerUsd,
    setRate,
    rateFetchedAt,
    darkMode,
    setDarkMode,
    categories,
    addCategory,
    removeCategory,
    resetCategories,
  } = useSettingsStore();

  const txStore = useTransactionStore();
  const budgetStore = useBudgetStore();
  const recurringStore = useRecurringStore();
  const billStore = useBillStore();
  const debtStore = useDebtStore();

  const { cursor } = useMonthContext();

  const transactions = useTransactionStore((s) => s.transactions);
  const monthly = useMemo(
    () => transactions.filter((t) => isInMonth(t.date, cursor)),
    [transactions, cursor],
  );

  const [manualRate, setManualRate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [catIcon, setCatIcon] = useState('');
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TxType>('expense');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function refreshRate() {
    setRefreshing(true);
    const r = await fetchUsdToNgn();
    setRefreshing(false);
    if (r) {
      setRate(r.ngnPerUsd, r.fetchedAt);
      flash('Rate refreshed');
    } else {
      flash('Could not fetch — keeping existing rate');
    }
  }

  function saveManualRate() {
    const n = Number(manualRate);
    if (!Number.isFinite(n) || n <= 0) return;
    setRate(n);
    setManualRate('');
    flash('Rate saved');
  }

  function exportAll() {
    const bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: txStore.transactions,
      budgets: budgetStore.budgets,
      recurring: recurringStore.recurring,
      bills: billStore.bills,
      debts: debtStore.debts,
      categories,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Exported');
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(String(ev.target?.result ?? ''));
        const n = normalizeImport(raw);
        txStore.replaceAll(n.transactions);
        budgetStore.replaceAll(n.budgets);
        recurringStore.replaceAll(n.recurring);
        billStore.replaceAll(n.bills);
        debtStore.replaceAll(n.debts);
        flash(`Imported ${n.transactions.length} transactions`);
      } catch {
        flash('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function wipeAll() {
    txStore.clear();
    budgetStore.clear();
    recurringStore.clear();
    billStore.clear();
    debtStore.clear();
    setConfirmWipe(false);
    flash('Everything cleared');
  }

  function toggleDark(v: boolean) {
    setDarkMode(v);
    document.documentElement.classList.toggle('dark', v);
  }

  function tryAddCategory() {
    const icon = catIcon.trim();
    if (!icon || !catName.trim()) return;
    const def: CategoryDef = { icon, name: catName.trim(), type: catType };
    addCategory(def);
    setCatIcon('');
    setCatName('');
  }

  return (
    <div className="flex flex-col">
      {/* Page title */}
      <div className="px-5 pt-6 pb-4 lg:px-6">
        <h1 className="font-display font-bold text-2xl">Settings</h1>
      </div>

      <div className="px-5 lg:px-6 flex flex-col gap-6 pb-28 lg:pb-12">
        {/* Insights / Reports */}
        <Section title="Insights">
          {transactions.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              hint="Log a few transactions to see spending breakdowns and trends."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-3">
                  Spending by category
                </h3>
                <CategoryDonut transactions={monthly} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-3">
                  Last 6 months
                </h3>
                <MonthComparison transactions={transactions} monthsBack={5} />
              </div>
            </div>
          )}
        </Section>

        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[15px]">Dark mode</div>
              <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
                Easier on your eyes at night.
              </div>
            </div>
            <button
              role="switch"
              aria-checked={darkMode}
              onClick={() => toggleDark(!darkMode)}
              className={cn(
                'relative h-7 w-12 rounded-full transition',
                darkMode ? 'bg-[var(--color-green)]' : 'bg-[var(--color-border)]',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white grid place-items-center transition-transform',
                  darkMode && 'translate-x-5',
                )}
              >
                {darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              </span>
            </button>
          </div>
        </Section>

        <Section title="Currency">
          <Select
            label="Default display currency"
            value={displayCurrency}
            onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}
          >
            <option value="NGN">₦ Nigerian Naira</option>
            <option value="USD">$ US Dollar</option>
          </Select>

          <div className="mt-3 p-3 rounded-xl bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)]">
            <div className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)]">
              Exchange rate
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="font-semibold">$1 = ₦{ngnPerUsd.toFixed(2)}</div>
              <Button
                variant="secondary"
                size="sm"
                onClick={refreshRate}
                disabled={refreshing}
                leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />}
              >
                Refresh
              </Button>
            </div>
            {rateFetchedAt && (
              <div className="text-xs text-[var(--color-text-3)] mt-1">
                Updated {timeAgo(rateFetchedAt)}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <Input
              label="Or set manually"
              placeholder={ngnPerUsd.toString()}
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              type="number"
              inputMode="decimal"
              leftAddon="₦ per $"
            />
            <Button onClick={saveManualRate} disabled={!manualRate} block>
              Save
            </Button>
          </div>
        </Section>

        <Section title="Backup">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              block
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportAll}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              block
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => fileInput.current?.click()}
            >
              Import JSON
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onFileChosen}
            />
          </div>
          <p className="text-xs text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mt-2">
            Backups from the original Budget Tracker Pro app import cleanly — legacy IDs are
            automatically normalized.
          </p>
        </Section>

        <Section title="Categories">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((c) => (
              <span
                key={`${c.type}-${c.icon}-${c.name}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] text-sm"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)]">
                  {c.type}
                </span>
                <button
                  onClick={() => removeCategory(c.icon, c.type)}
                  aria-label={`Remove ${c.name}`}
                  className="h-6 w-6 grid place-items-center rounded-full hover:bg-[var(--color-red)]/10 hover:text-[var(--color-red)] transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[64px_minmax(0,1fr)_108px] gap-2 items-end">
            <Input
              label="Emoji"
              placeholder="🍱"
              value={catIcon}
              onChange={(e) => setCatIcon(e.target.value)}
              maxLength={4}
            />
            <Input
              label="Name"
              placeholder="e.g. Coffee"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
            <Select
              label="Type"
              value={catType}
              onChange={(e) => setCatType(e.target.value as TxType)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={tryAddCategory}
              disabled={!catIcon || !catName}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add category
            </Button>
            <Button
              variant="ghost"
              onClick={resetCategories}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset to defaults
            </Button>
          </div>
        </Section>

        <Section title="Danger zone">
          <Button
            variant="danger"
            block
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setConfirmWipe(true)}
          >
            Delete all data
          </Button>
        </Section>
      </div>

      <ConfirmDialog
        open={confirmWipe}
        title="Delete everything?"
        body="This wipes transactions, budgets, recurring rules, bills, debts and payment history. Your categories stay."
        confirmLabel="Yes, delete all"
        destructive
        onCancel={() => setConfirmWipe(false)}
        onConfirm={wipeAll}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-[var(--color-surface-dark)] rounded-2xl p-4 shadow-sm">
      <h2 className="font-display text-base font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
