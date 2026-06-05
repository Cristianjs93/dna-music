import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { FormField } from '@/components/common/FormField';
import { DnaButton, DnaDropdown, DnaInputText, DnaPassword } from '@/components/ui';
import type { UserFormValues } from '@/hooks/users/user.types';
import type { Headquarter } from '@/types/headquarter.types';
import type { Role } from '@/types/common.types';
import type { User } from '@/types/user.types';
import { emailRule, passwordRule, requiredRule } from '@/utils/validationRules';

const roleOptions = [
  { label: 'Administrador', value: 'ADMIN' as Role },
  { label: 'Operador', value: 'OPERADOR' as Role },
];

interface UserFormDialogProps {
  visible: boolean;
  editing: User | null;
  initialValues: UserFormValues;
  saving: boolean;
  activeHeadquarters: Headquarter[];
  onHide: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserFormDialog({
  visible,
  editing,
  initialValues,
  saving,
  activeHeadquarters,
  onHide,
  onSubmit,
}: UserFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({ defaultValues: initialValues });

  useEffect(() => {
    if (visible) reset(initialValues);
  }, [visible, initialValues, reset]);

  const selectedRole = watch('role');

  return (
    <Dialog
      visible={visible}
      header={editing ? 'Editar usuario' : 'Nuevo usuario'}
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
        <FormField label="Nombre" error={errors.name?.message} htmlFor="user-name">
          <DnaInputText id="user-name" autoComplete="off" {...register('name', requiredRule)} />
        </FormField>
        <FormField label="Correo" error={errors.email?.message} htmlFor="user-email">
          <DnaInputText
            id="user-email"
            type="email"
            autoComplete="off"
            {...register('email', emailRule)}
          />
        </FormField>
        {!editing && (
          <FormField label="Contraseña" error={errors.password?.message} htmlFor="user-password">
            <Controller
              name="password"
              control={control}
              rules={passwordRule}
              render={({ field }) => (
                <DnaPassword
                  inputId="user-password"
                  toggleMask
                  feedback={false}
                  autoComplete="new-password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </FormField>
        )}
        <FormField label="Rol" error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            rules={requiredRule}
            render={({ field }) => (
              <DnaDropdown
                options={roleOptions}
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
        </FormField>
        {selectedRole === 'OPERADOR' && (
          <FormField label="Sede" error={errors.headquarterId?.message}>
            <Controller
              name="headquarterId"
              control={control}
              rules={requiredRule}
              render={({ field }) => (
                <DnaDropdown
                  options={activeHeadquarters.map((hq) => ({
                    label: `${hq.name} (${hq.city})`,
                    value: hq.id,
                  }))}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Seleccionar sede"
                />
              )}
            />
          </FormField>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <DnaButton type="button" variant="secondary" label="Cancelar" onClick={onHide} />
          <DnaButton type="submit" variant="primary" label="Guardar" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
