import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative w-full sm:w-[440px] sm:max-w-[calc(100vw-2rem)] bg-white dark:bg-[var(--color-surface-dark)] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col safe-pb"
          >
            <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
              <h2 className="font-display text-lg font-bold pt-1">{title}</h2>
              <button
                onClick={onClose}
                className="h-9 w-9 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 -mr-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-6 pt-3 pb-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex gap-2 justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
