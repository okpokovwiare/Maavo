import { AnimatePresence, motion } from 'framer-motion';
import type { Transaction } from '@/types';
import { TransactionCard } from './TransactionCard';

interface Props {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.18 }}
          >
            <TransactionCard tx={tx} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
