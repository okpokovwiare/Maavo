import type { Recurring, Transaction } from '@/types';
import { shouldMaterialize, todayISO } from './date';
import { uuid } from './id';

export interface MaterializeResult {
  newTransactions: Transaction[];
  updatedRecurring: Recurring[];
}

/**
 * Walk all recurring rules; for any that should fire today, emit a transaction
 * and mark the rule's lastProcessed. Pure function — the caller applies results
 * to its stores.
 */
export function materializeDue(
  recurrings: Recurring[],
  existing: Transaction[],
  today: string = todayISO(),
): MaterializeResult {
  const newTransactions: Transaction[] = [];
  const updatedRecurring: Recurring[] = recurrings.map((rule) => {
    if (
      !shouldMaterialize({
        frequency: rule.frequency,
        startDate: rule.startDate,
        lastProcessed: rule.lastProcessed,
        today,
      })
    ) {
      return rule;
    }

    // Dedupe against any existing tx already linked to this rule on today's date.
    const duplicate = existing.find(
      (t) => t.recurringId === rule.id && t.date === today,
    );
    if (duplicate) return rule;

    newTransactions.push({
      id: uuid(),
      type: rule.type,
      amount: rule.amount,
      currency: rule.currency,
      description: rule.description,
      category: rule.category,
      date: today,
      isRecurring: true,
      recurringId: rule.id,
      createdAt: new Date().toISOString(),
    });

    return { ...rule, lastProcessed: today };
  });

  return { newTransactions, updatedRecurring };
}
