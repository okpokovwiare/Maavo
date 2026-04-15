import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebtStore } from '@/stores/useDebtStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { todayISO } from '@/lib/date';
import type { Currency, DebtDirection } from '@/types';

const schema = z.object({
  direction: z.enum(['owed', 'lent']),
  person: z.string().min(1, 'Who is this with?').max(60),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.enum(['NGN', 'USD']),
  description: z.string().max(120).optional(),
  date: z.string().min(1, 'Pick a date'),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DebtForm({ open, onClose }: Props) {
  const add = useDebtStore((s) => s.add);
  const displayCurrency = useSettingsStore((s) => s.displayCurrency);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      direction: 'owed',
      person: '',
      amount: 0,
      currency: displayCurrency,
      description: '',
      date: todayISO(),
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
      direction: parsed.data.direction as DebtDirection,
      person: parsed.data.person.trim(),
      amount: parsed.data.amount,
      currency: parsed.data.currency as Currency,
      description: parsed.data.description?.trim() || undefined,
      date: parsed.data.date,
    });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add debt"
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
        <Select {...register('direction')} label="Type">
          <option value="owed">I owe someone</option>
          <option value="lent">Someone owes me</option>
        </Select>
        <Input
          {...register('person')}
          label="Person"
          placeholder="e.g. Mum, John"
          error={errors.person?.message}
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
          {...register('description')}
          label="Note (optional)"
          placeholder="What was it for?"
        />
        <Input {...register('date')} type="date" label="Date" error={errors.date?.message} />
      </form>
    </Modal>
  );
}
