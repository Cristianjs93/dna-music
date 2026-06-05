import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { FormField } from '@/components/common/FormField';
import { DnaButton, DnaInputText } from '@/components/ui';
import type { HeadquarterFormValues } from '@/hooks/headquarters/headquarter.types';
import type { Headquarter } from '@/types/headquarter.types';
import { requiredRule } from '@/utils/validationRules';

interface HeadquarterFormDialogProps {
  visible: boolean;
  editing: Headquarter | null;
  initialValues: HeadquarterFormValues;
  saving: boolean;
  onHide: () => void;
  onSubmit: (values: HeadquarterFormValues) => Promise<void>;
}

export function HeadquarterFormDialog({
  visible,
  editing,
  initialValues,
  saving,
  onHide,
  onSubmit,
}: HeadquarterFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HeadquarterFormValues>({ defaultValues: initialValues });

  useEffect(() => {
    if (visible) reset(initialValues);
  }, [visible, initialValues, reset]);

  return (
    <Dialog
      visible={visible}
      header={editing ? 'Editar sede' : 'Nueva sede'}
      onHide={onHide}
      className="w-full max-w-lg"
      modal
    >
      <form
        key={editing?.id ?? 'create'}
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Nombre" error={errors.name?.message} htmlFor="hq-name">
          <DnaInputText id="hq-name" autoComplete="off" {...register('name', requiredRule)} />
        </FormField>
        <FormField label="Ciudad" error={errors.city?.message} htmlFor="hq-city">
          <DnaInputText id="hq-city" autoComplete="off" {...register('city', requiredRule)} />
        </FormField>
        <FormField label="Dirección" error={errors.address?.message} htmlFor="hq-address">
          <DnaInputText id="hq-address" autoComplete="off" {...register('address', requiredRule)} />
        </FormField>
        <div className="flex items-center gap-3">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <InputSwitch checked={field.value} onChange={(e) => field.onChange(e.value)} />
            )}
          />
          <span className="text-sm text-dna-muted">Sede activa</span>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <DnaButton type="button" variant="secondary" label="Cancelar" onClick={onHide} />
          <DnaButton type="submit" variant="primary" label="Guardar" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
