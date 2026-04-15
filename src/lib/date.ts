import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import type { Frequency } from '@/types';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function toISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function monthLabel(d: Date): string {
  return format(d, 'MMMM yyyy');
}

export function monthRange(d: Date): { start: string; end: string } {
  return { start: toISO(startOfMonth(d)), end: toISO(endOfMonth(d)) };
}

export function isInMonth(dateISO: string, monthCursor: Date): boolean {
  const { start, end } = monthRange(monthCursor);
  return dateISO >= start && dateISO <= end;
}

export function shiftMonth(d: Date, delta: number): Date {
  return delta >= 0 ? addMonths(d, delta) : subMonths(d, -delta);
}

export function daysFromToday(dateISO: string): number {
  return differenceInCalendarDays(parseISO(dateISO), new Date());
}

export function relativeDue(dateISO: string): {
  kind: 'overdue' | 'today' | 'soon' | 'later';
  label: string;
} {
  const diff = daysFromToday(dateISO);
  if (diff < 0) {
    const d = Math.abs(diff);
    return { kind: 'overdue', label: `Overdue by ${d} day${d !== 1 ? 's' : ''}` };
  }
  if (diff === 0) return { kind: 'today', label: 'Due today' };
  if (diff <= 3) return { kind: 'soon', label: `Due in ${diff} day${diff !== 1 ? 's' : ''}` };
  return { kind: 'later', label: `Due in ${diff} days` };
}

/**
 * Given a recurring rule and a target date, compute whether a new materialization
 * should happen. Stateless — caller owns the `lastProcessed` update.
 */
export function shouldMaterialize(opts: {
  frequency: Frequency;
  startDate: string;
  lastProcessed?: string;
  today?: string;
}): boolean {
  const today = opts.today ?? todayISO();
  const todayDate = parseISO(today);
  const startDate = parseISO(opts.startDate);
  if (isBefore(todayDate, startDate)) return false;

  if (!opts.lastProcessed) return true;
  const last = parseISO(opts.lastProcessed);

  switch (opts.frequency) {
    case 'daily':
      return differenceInCalendarDays(todayDate, last) >= 1;
    case 'weekly':
      return differenceInCalendarDays(todayDate, last) >= 7;
    case 'monthly':
      return (
        todayDate.getUTCFullYear() !== last.getUTCFullYear() ||
        todayDate.getUTCMonth() !== last.getUTCMonth()
      );
  }
}

export function prettyDate(dateISO: string): string {
  try {
    return format(parseISO(dateISO), 'MMM d, yyyy');
  } catch {
    return dateISO;
  }
}

export { isAfter, isBefore };
