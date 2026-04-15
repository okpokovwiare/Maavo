import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Home } from '@/routes/Home';
import { Activity } from '@/routes/Activity';
import { Settings } from '@/routes/Settings';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useRecurringStore } from '@/stores/useRecurringStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { materializeDue } from '@/lib/recurring';

export default function App() {
  const location = useLocation();
  const darkMode = useSettingsStore((s) => s.darkMode);

  useExchangeRate();

  // Apply dark mode class on mount and when toggled.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Auto-materialize recurring rules once on mount.
  useEffect(() => {
    const rec = useRecurringStore.getState().recurring;
    const tx = useTransactionStore.getState().transactions;
    const { newTransactions, updatedRecurring } = materializeDue(rec, tx);
    if (newTransactions.length > 0) {
      useTransactionStore.getState().appendMany(newTransactions);
      useRecurringStore.getState().replaceAll(updatedRecurring);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
