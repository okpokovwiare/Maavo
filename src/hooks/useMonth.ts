import { useCallback, useState } from 'react';
import { shiftMonth } from '@/lib/date';

/**
 * Month cursor. Not persisted — resets to current on every reload, which is
 * usually what you want.
 */
export function useMonth() {
  const [cursor, setCursor] = useState<Date>(() => new Date());

  const prev = useCallback(() => setCursor((d) => shiftMonth(d, -1)), []);
  const next = useCallback(() => setCursor((d) => shiftMonth(d, 1)), []);
  const reset = useCallback(() => setCursor(new Date()), []);

  return { cursor, setCursor, prev, next, reset };
}
