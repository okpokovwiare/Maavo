import type {
  Bill,
  Budget,
  Currency,
  Debt,
  Recurring,
  Transaction,
} from '@/types';
import { uuid } from './id';

/**
 * The old app stored:
 *   - transactions: [{ id: number, type, amount, currency, description, category, date, isRecurring? }]
 *   - budgets: { [categoryIcon]: number }   (not an array)
 *   - recurring: [{ id: number, type, amount, currency, description, category, frequency, startDate, lastProcessed? }]
 *   - bills: [{ id: number, name, amount, originalAmount?, currency, dueDate, paid }]
 *   - debts: [{ id: number, type: 'owe'|'lent', person, amount, originalAmount?, currency, desc?, date, settled }]
 *
 * This adapter converts whatever shape the backup has into the new typed shape.
 */

type LegacyTx = {
  id: number | string;
  type: 'income' | 'expense';
  amount: number;
  currency?: Currency;
  description?: string;
  category?: string;
  date: string;
  isRecurring?: boolean;
};

type LegacyRecurring = {
  id: number | string;
  type: 'income' | 'expense';
  amount: number;
  currency?: Currency;
  description?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  lastProcessed?: string;
};

type LegacyBill = {
  id: number | string;
  name: string;
  amount: number;
  originalAmount?: number;
  currency?: Currency;
  dueDate: string;
  paid?: boolean;
};

type LegacyDebt = {
  id: number | string;
  type?: 'owe' | 'lent';
  direction?: 'owed' | 'lent';
  person: string;
  amount: number;
  originalAmount?: number;
  currency?: Currency;
  desc?: string;
  description?: string;
  date: string;
  settled?: boolean;
};

export interface NormalizedImport {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: Recurring[];
  bills: Bill[];
  debts: Debt[];
}

const DEFAULT_CURRENCY: Currency = 'NGN';

function normalizeCurrency(c: unknown): Currency {
  return c === 'USD' ? 'USD' : 'NGN';
}

export function normalizeImport(raw: unknown): NormalizedImport {
  const src = (raw ?? {}) as {
    transactions?: LegacyTx[];
    budgets?: Record<string, number> | Budget[];
    recurring?: LegacyRecurring[];
    recurringTransactions?: LegacyRecurring[];
    bills?: LegacyBill[];
    debts?: LegacyDebt[];
  };

  const recurringSource = src.recurringTransactions ?? src.recurring ?? [];

  const transactions: Transaction[] = (src.transactions ?? []).map((t) => ({
    id: String(t.id ?? uuid()).includes('-') ? String(t.id) : uuid(),
    type: t.type,
    amount: Number(t.amount) || 0,
    currency: normalizeCurrency(t.currency),
    description: t.description ?? '',
    category: t.category ?? '➕',
    date: t.date,
    isRecurring: t.isRecurring,
    createdAt: new Date().toISOString(),
  }));

  let budgets: Budget[] = [];
  if (Array.isArray(src.budgets)) {
    budgets = src.budgets.map((b) => ({
      category: b.category,
      limit: Number(b.limit) || 0,
      currency: normalizeCurrency(b.currency),
    }));
  } else if (src.budgets && typeof src.budgets === 'object') {
    budgets = Object.entries(src.budgets).map(([category, limit]) => ({
      category,
      limit: Number(limit) || 0,
      currency: DEFAULT_CURRENCY,
    }));
  }

  const recurring: Recurring[] = recurringSource.map((r) => ({
    id: uuid(),
    type: r.type,
    amount: Number(r.amount) || 0,
    currency: normalizeCurrency(r.currency),
    description: r.description ?? '',
    category: r.category ?? '➕',
    frequency: r.frequency,
    startDate: r.startDate,
    lastProcessed: r.lastProcessed,
    createdAt: new Date().toISOString(),
  }));

  const bills: Bill[] = (src.bills ?? []).map((b) => ({
    id: uuid(),
    name: b.name,
    amount: Number(b.amount) || 0,
    originalAmount: Number(b.originalAmount ?? b.amount) || 0,
    currency: normalizeCurrency(b.currency),
    dueDate: b.dueDate,
    paid: Boolean(b.paid),
    payments: [],
    createdAt: new Date().toISOString(),
  }));

  const debts: Debt[] = (src.debts ?? []).map((d) => ({
    id: uuid(),
    direction: d.direction ?? (d.type === 'owe' ? 'owed' : 'lent'),
    person: d.person,
    amount: Number(d.amount) || 0,
    originalAmount: Number(d.originalAmount ?? d.amount) || 0,
    currency: normalizeCurrency(d.currency),
    description: d.description ?? d.desc,
    date: d.date,
    settled: Boolean(d.settled),
    payments: [],
    createdAt: new Date().toISOString(),
  }));

  return { transactions, budgets, recurring, bills, debts };
}
