import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useBudgetStore } from '@/stores/useBudgetStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Currency } from '@/types';

const schema = z.object({
  category: z.string().min(1, 'Choose a category'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.enum(['NGN', 'USD']),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BudgetForm({ open, onClose }: Props) {
  const upsert = useBudgetStore((s) => s.upsert);
  const categories = useSettingsStore((s) => s.categories);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);
  const expenseCats = categories.filter((c) => c.type === 'expense');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      category: expenseCats[0]?.icon ?? '',
      amount: 0,
      currency: displayCurrency,
    },
  });

  function close() {
    reset();
    onClose();
  }

  function onSubmit(values: Values) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    upsert({
      category: parsed.data.category,
      limit: parsed.data.amount,
      currency: parsed.data.currency as Currency,
    });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Set a budget"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select {...register('category')} label="Category" error={errors.category?.message}>
          {expenseCats.map((c) => (
            <option key={`${c.icon}-${c.name}`} value={c.icon}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
          <Input
            {...register('amount', { valueAsNumber: true })}
            label="Monthly limit"
            type="number"
            step="0.01"
            placeholder="0.00"
            inputMode="decimal"
            error={errors.amount?.message}
          />
          <Select {...register('currency')} label="Currency">
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
          </Select>
        </div>
      </form>
    </Modal>
  );
}
