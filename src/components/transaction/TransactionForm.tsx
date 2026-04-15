import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategoryPicker } from './CategoryPicker';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { todayISO } from '@/lib/date';
import type { Currency, TxType } from '@/types';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.enum(['NGN', 'USD']),
  description: z.string().min(1, 'Describe this transaction').max(120),
  date: z.string().min(1, 'Pick a date'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  initialType?: TxType;
}

export function TransactionForm({ open, onClose, initialType = 'expense' }: Props) {
  const add = useTransactionStore((s) => s.add);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);

  const [type, setType] = useState<TxType>(initialType);
  const [category, setCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: initialType,
      amount: 0,
      currency: displayCurrency,
      description: '',
      date: todayISO(),
    },
  });

  function close() {
    reset({
      type: initialType,
      amount: 0,
      currency: displayCurrency,
      description: '',
      date: todayISO(),
    });
    setCategory('');
    setType(initialType);
    onClose();
  }

  function onSubmit(values: FormValues) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    if (!category) return;

    add({
      type,
      amount: parsed.data.amount,
      currency: parsed.data.currency as Currency,
      description: parsed.data.description.trim(),
      category,
      date: parsed.data.date,
    });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add transaction"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={!category}>
            Save
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
          }
        }}
      >
        <div className="grid grid-cols-2 p-1 bg-[var(--color-surface-2)] dark:bg-[var(--color-surface-2-dark)] rounded-xl gap-1">
          {(['expense', 'income'] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory('');
              }}
              className={[
                'h-10 rounded-lg text-sm font-semibold capitalize transition',
                type === t
                  ? 'bg-white dark:bg-[var(--color-surface-dark)] shadow-sm text-[var(--color-text)] dark:text-[var(--color-text-dark)]'
                  : 'text-[var(--color-text-2)]',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
          <Input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            label="Amount"
            error={errors.amount?.message}
            inputMode="decimal"
          />
          <Select {...register('currency')} label="Currency">
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
          </Select>
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="e.g. Lunch with team"
          error={errors.description?.message}
        />

        <Input
          {...register('date')}
          type="date"
          label="Date"
          error={errors.date?.message}
        />

        <div>
          <div className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-2">
            Category
          </div>
          <CategoryPicker type={type} selected={category} onSelect={setCategory} />
          {!category && (
            <div className="text-xs text-[var(--color-red)] mt-1">
              Pick a category
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
