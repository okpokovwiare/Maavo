import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useBillStore } from '@/stores/useBillStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { todayISO } from '@/lib/date';
import type { Currency } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Bill name').max(80),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.enum(['NGN', 'USD']),
  dueDate: z.string().min(1, 'Pick a due date'),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BillForm({ open, onClose }: Props) {
  const add = useBillStore((s) => s.add);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      name: '',
      amount: 0,
      currency: displayCurrency,
      dueDate: todayISO(),
    },
  });

  function close() {
    reset();
    onClose();
  }

  function onSubmit(v: Values) {
    const parsed = schema.safeParse(v);
    if (!parsed.success) return;
    add({
      name: parsed.data.name.trim(),
      amount: parsed.data.amount,
      currency: parsed.data.currency as Currency,
      dueDate: parsed.data.dueDate,
    });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add upcoming bill"
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
        <Input
          {...register('name')}
          label="Bill name"
          placeholder="e.g. Electricity, Rent"
          error={errors.name?.message}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
          <Input
            {...register('amount', { valueAsNumber: true })}
            label="Amount"
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
        <Input
          {...register('dueDate')}
          type="date"
          label="Due date"
          error={errors.dueDate?.message}
        />
      </form>
    </Modal>
  );
}
