/**
 * Fetch live USD -> NGN rate from open.er-api.com (free, no API key, CORS-enabled).
 * Falls back to a recent-cached or default rate.
 */
const DEFAULT_NGN_PER_USD = 1650;
const ENDPOINT = 'https://open.er-api.com/v6/latest/USD';

export interface FetchedRate {
  ngnPerUsd: number;
  fetchedAt: string; // ISO timestamp
}

export async function fetchUsdToNgn(signal?: AbortSignal): Promise<FetchedRate | null> {
  try {
    const res = await fetch(ENDPOINT, { signal });
    if (!res.ok) return null;
    const data: { result?: string; rates?: Record<string, number> } = await res.json();
    if (data.result !== 'success' || !data.rates?.NGN) return null;
    return { ngnPerUsd: data.rates.NGN, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export { DEFAULT_NGN_PER_USD };
