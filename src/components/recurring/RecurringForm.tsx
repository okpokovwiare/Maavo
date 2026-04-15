import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategoryPicker } from '@/components/transaction/CategoryPicker';
import { useRecurringStore } from '@/stores/useRecurringStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { todayISO } from '@/lib/date';
import type { Currency, Frequency, TxType } from '@/types';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.enum(['NGN', 'USD']),
  description: z.string().min(1, 'Describe this').max(120),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().min(1, 'Pick a start date'),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RecurringForm({ open, onClose }: Props) {
  const add = useRecurringStore((s) => s.add);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const [type, setType] = useState<TxType>('expense');
  const [category, setCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      type: 'expense',
      amount: 0,
      currency: displayCurrency,
      description: '',
      frequency: 'monthly',
      startDate: todayISO(),
    },
  });

  function close() {
    reset();
    setCategory('');
    setType('expense');
    onClose();
  }

  function onSubmit(v: Values) {
    if (!category) return;
    const parsed = schema.safeParse(v);
    if (!parsed.success) return;
    add({
      type,
      amount: parsed.data.amount,
      currency: parsed.data.currency as Currency,
      description: parsed.data.description.trim(),
      category,
      frequency: parsed.data.frequency as Frequency,
      startDate: parsed.data.startDate,
    });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add recurring"
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  ? 'bg-white dark:bg-[var(--color-surface-dark)] shadow-sm'
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
            inputMode="decimal"
            error={errors.amount?.message}
          />
          <Select {...register('currency')} label="Currency">
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
          </Select>
        </div>

        <Input
          {...register('description')}
          label="Description"
          placeholder="e.g. Rent, Netflix"
          error={errors.description?.message}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select {...register('frequency')} label="Frequency">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
          <Input {...register('startDate')} type="date" label="Starts" />
        </div>

        <div>
          <div className="text-[13px] font-medium text-[var(--color-text-2)] dark:text-[var(--color-text-2-dark)] mb-2">
            Category
          </div>
          <CategoryPicker type={type} selected={category} onSelect={setCategory} />
        </div>
      </form>
    </Modal>
  );
}
