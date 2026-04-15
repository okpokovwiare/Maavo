import type { Currency } from '@/types';

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
};

/**
 * Convert an amount between currencies using a rates table keyed by currency
 * and denominated relative to a common base. The store holds { USD: 1, NGN: <rate> }.
 */
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>,
): number {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return amount * (toRate / fromRate);
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function formatCompactMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${amount < 0 ? '-' : ''}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${amount < 0 ? '-' : ''}${symbol}${(abs / 1_000).toFixed(1)}k`;
  return formatMoney(amount, currency);
}

export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
