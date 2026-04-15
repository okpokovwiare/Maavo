import type { CategoryDef } from '@/types';

/**
 * A trimmed default set — the originals had personal names baked in.
 * Users can edit the list in Settings.
 */
export const DEFAULT_CATEGORIES: CategoryDef[] = [
  // Expense
  { icon: '🍔', name: 'Food', type: 'expense' },
  { icon: '🏠', name: 'Rent', type: 'expense' },
  { icon: '🚗', name: 'Transport', type: 'expense' },
  { icon: '⚡', name: 'Utilities', type: 'expense' },
  { icon: '🌐', name: 'Internet', type: 'expense' },
  { icon: '📺', name: 'Subscriptions', type: 'expense' },
  { icon: '🎓', name: 'Education', type: 'expense' },
  { icon: '✂️', name: 'Personal care', type: 'expense' },
  { icon: '🎮', name: 'Entertainment', type: 'expense' },
  { icon: '👗', name: 'Shopping', type: 'expense' },
  { icon: '💊', name: 'Health', type: 'expense' },
  { icon: '🎁', name: 'Gifts', type: 'expense' },
  { icon: '💳', name: 'Debt repayment', type: 'expense' },
  { icon: '💰', name: 'Savings', type: 'expense' },
  { icon: '📈', name: 'Investment', type: 'expense' },
  { icon: '➕', name: 'Other', type: 'expense' },
  // Income
  { icon: '💼', name: 'Salary', type: 'income' },
  { icon: '🧾', name: 'Business', type: 'income' },
  { icon: '🎯', name: 'Freelance', type: 'income' },
  { icon: '🏆', name: 'Bonus', type: 'income' },
  { icon: '🎁', name: 'Gift', type: 'income' },
  { icon: '💸', name: 'Refund', type: 'income' },
  { icon: '📈', name: 'Investment', type: 'income' },
  { icon: '⭐', name: 'Other', type: 'income' },
];

export function findCategoryName(
  categories: CategoryDef[],
  icon: string,
  type: 'income' | 'expense',
): string | undefined {
  return categories.find((c) => c.icon === icon && c.type === type)?.name;
}
