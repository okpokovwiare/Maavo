import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { fetchUsdToNgn } from '@/lib/exchange-rate';

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

/**
 * On mount, if we have no rate or the cached rate is older than 12h, refetch.
 * Silent on failure — existing cached value stays.
 */
export function useExchangeRate() {
  const setRate = useSettingsStore((s) => s.setRate);
  const rateFetchedAt = useSettingsStore((s) => s.rateFetchedAt);

  useEffect(() => {
    const controller = new AbortController();
    const age = rateFetchedAt ? Date.now() - new Date(rateFetchedAt).getTime() : Infinity;
    if (age > TWELVE_HOURS) {
      fetchUsdToNgn(controller.signal).then((r) => {
        if (r) setRate(r.ngnPerUsd, r.fetchedAt);
      });
    }
    return () => controller.abort();
  }, [rateFetchedAt, setRate]);
}
