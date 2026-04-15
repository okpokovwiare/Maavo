import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Receipt, Wallet, Users, Target, Repeat } from 'lucide-react';
import { cn } from '@/lib/cn';

export type FabAction = 'transaction' | 'budget' | 'recurring' | 'bill' | 'debt';

interface Props {
  onAction: (action: FabAction) => void;
}

const ACTIONS: Array<{ id: FabAction; label: string; icon: typeof Plus; color: string }> = [
  { id: 'transaction', label: 'Transaction', icon: Wallet, color: 'var(--color-green)' },
  { id: 'budget', label: 'Budget', icon: Target, color: 'var(--color-blue)' },
  { id: 'recurring', label: 'Recurring', icon: Repeat, color: 'var(--color-purple)' },
  { id: 'bill', label: 'Bill', icon: Receipt, color: 'var(--color-amber)' },
  { id: 'debt', label: 'Debt', icon: Users, color: '#6366f1' },
];

export function Fab({ onAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            aria-hidden
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 safe-pb">
        <AnimatePresence>
          {open && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-end gap-2"
            >
              {ACTIONS.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => {
                    setOpen(false);
                    onAction(a.id);
                  }}
                  className="flex items-center gap-2.5 bg-white dark:bg-[var(--color-surface-dark)] pl-4 pr-2 h-11 rounded-full shadow-lg"
                >
                  <span className="text-sm font-semibold">Add {a.label}</span>
                  <span
                    className="h-8 w-8 rounded-full grid place-items-center text-white"
                    style={{ background: a.color }}
                  >
                    <a.icon className="w-4 h-4" />
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'h-14 w-14 rounded-full grid place-items-center text-white shadow-[var(--shadow-fab)] transition-transform',
            'bg-[var(--color-green)] hover:brightness-110 active:scale-95',
          )}
          aria-label={open ? 'Close menu' : 'Add new'}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </motion.span>
        </button>
      </div>
    </>
  );
}
