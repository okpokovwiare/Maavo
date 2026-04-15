export type Currency = 'NGN' | 'USD';
export type TxType = 'income' | 'expense';
export type Frequency = 'daily' | 'weekly' | 'monthly';
export type DebtDirection = 'owed' | 'lent'; // 'owed' = I owe someone, 'lent' = someone owes me

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  currency: Currency;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
}

export interface Budget {
  category: string;
  limit: number;
  currency: Currency;
}

export interface Recurring {
  id: string;
  type: TxType;
  amount: number;
  currency: Currency;
  description: string;
  category: string;
  frequency: Frequency;
  startDate: string;
  lastProcessed?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  originalAmount: number;
  currency: Currency;
  dueDate: string;
  paid: boolean;
  payments: Payment[];
  createdAt: string;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  person: string;
  amount: number;
  originalAmount: number;
  currency: Currency;
  description?: string;
  date: string;
  settled: boolean;
  payments: Payment[];
  createdAt: string;
}

export interface CategoryDef {
  icon: string; // emoji
  name: string;
  type: TxType;
}

export interface ExportBundle {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  budgets: Record<string, number> | Budget[];
  recurring: Recurring[];
  bills: Bill[];
  debts: Debt[];
  categories?: CategoryDef[];
}
