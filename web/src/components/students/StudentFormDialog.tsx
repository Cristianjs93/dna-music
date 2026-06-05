import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog } from 'primereact/dialog';
import { FormField } from '@/components/common/FormField';
import { DnaButton, DnaCalendar, DnaDropdown, DnaInputText } from '@/components/ui';
import type { StudentFormValues } from '@/hooks/students/student.types';
import type { Student, StudentStatus } from '@/types/student.types';
import { emailRule, requiredRule } from '@/utils/validationRules';

const statusOptions = [
  { label: 'Activo', value: 'ACTIVO' as StudentStatus },
  { label: 'Inactivo', value: 'INACTIVO' as StudentStatus },
  { label: 'Retirado', value: 'RETIRADO' as StudentStatus },
];

interface StudentFormDialogProps {
  visible: boolean;
  editing: Student | null;
  initialValues: StudentFormValues;
  saving: boolean;
  isAdmin: boolean;
  headquarterOptions: { label: string; value: string }[];
  onHide: () => void;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

export function StudentFormDialog({
  visible,
  editing,
  initialValues,
  saving,
  isAdmin,
  headquarterOptions,
  onHide,
  onSubmit,
}: StudentFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({ defaultValues: initialValues });

  useEffect(() => {
    if (visible) reset(initialValues);
  }, [visible, initialValues, reset]);

  return (
    <Dialog
      visible={visible}
      header={editing ? 'Editar estudiante' : 'Nuevo estudiante'}
      onHide={onHide}
      className="w-full max-w-2xl"
      modal
    >
      <form
        key={editing?.id ?? 'create'}
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 md:grid-cols-2"
      >
        <FormField
          label="Nombre completo"
          error={errors.fullName?.message}
          htmlFor="student-fullname"
          className="md:col-span-2"
        >
          <DnaInputText
            id="student-fullname"
            autoComplete="off"
            {...register('fullName', requiredRule)}
          />
        </FormField>
        <FormField
          label="Correo"
          error={errors.email?.message}
          htmlFor="student-email"
          className="md:col-span-2"
        >
          <DnaInputText
            id="student-email"
            type="email"
            autoComplete="off"
            {...register('email', emailRule)}
          />
        </FormField>
        <FormField label="Teléfono" error={errors.phone?.message} htmlFor="student-phone">
          <DnaInputText
            id="student-phone"
            autoComplete="off"
            {...register('phone', requiredRule)}
          />
        </FormField>
        <FormField label="Documento" error={errors.identityCard?.message} htmlFor="student-id">
          <DnaInputText
            id="student-id"
            autoComplete="off"
            {...register('identityCard', requiredRule)}
          />
        </FormField>
        <FormField label="Programa" error={errors.program?.message} htmlFor="student-program">
          <DnaInputText
            id="student-program"
            autoComplete="off"
            {...register('program', requiredRule)}
          />
        </FormField>
        <FormField label="Sede" error={errors.headquarterId?.message}>
          <Controller
            name="headquarterId"
            control={control}
            rules={requiredRule}
            render={({ field }) => (
              <DnaDropdown
                options={headquarterOptions}
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                disabled={!isAdmin}
                placeholder="Seleccionar sede"
              />
            )}
          />
        </FormField>
        <FormField label="Estado" error={errors.status?.message}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <DnaDropdown
                options={statusOptions}
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
              />
            )}
          />
        </FormField>
        <FormField label="Fecha de matrícula" error={errors.enrollmentDate?.message}>
          <Controller
            name="enrollmentDate"
            control={control}
            render={({ field }) => (
              <DnaCalendar
                value={field.value}
                onChange={(e) => field.onChange(e.value ?? null)}
                dateFormat="yy-mm-dd"
                showIcon
              />
            )}
          />
        </FormField>
        <div className="flex justify-end gap-2 md:col-span-2">
          <DnaButton type="button" variant="secondary" label="Cancelar" onClick={onHide} />
          <DnaButton type="submit" variant="primary" label="Guardar" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
