import { Controller, useForm } from 'react-hook-form';
import { Message } from 'primereact/message';
import { FormField } from '@/components/common/FormField';
import { DnaButton, DnaInputText, DnaLogo, DnaPassword } from '@/components/ui';
import { useLogin, type LoginFormValues } from '@/hooks/useLogin';
import { validationMessages } from '@/utils/errorMessages';

export default function LoginPage() {
  const { loginUser, error, loading } = useLogin();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-dna-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-dna-border bg-dna-surface p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <DnaLogo className="mx-auto" height="h-[4.5rem]" />
          <h1 className="mt-6 text-xl font-bold uppercase tracking-wide text-white">
            Acceso interno
          </h1>
          <p className="mt-2 text-sm text-dna-muted">
            Ingresa con las credenciales asignadas por el administrador.
          </p>
        </div>

        {error && <Message severity="error" text={error} className="mb-4 w-full" />}

        <form autoComplete="on" onSubmit={handleSubmit(loginUser)} className="space-y-5">
          <FormField label="Correo" error={errors.email?.message} htmlFor="login-email">
            <DnaInputText
              id="login-email"
              type="email"
              autoComplete="username"
              {...register('email', {
                required: validationMessages.required,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: validationMessages.email,
                },
              })}
            />
          </FormField>

          <FormField label="Contraseña" error={errors.password?.message} htmlFor="login-password">
            <Controller
              name="password"
              control={control}
              rules={{ required: validationMessages.required }}
              render={({ field }) => (
                <DnaPassword
                  inputId="login-password"
                  toggleMask
                  feedback={false}
                  autoComplete="current-password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </FormField>

          <DnaButton
            type="submit"
            variant="primary"
            label={loading ? 'Ingresando...' : 'Ingresar'}
            icon="pi pi-arrow-right"
            iconPos="right"
            loading={loading}
            className="dna-btn-login mt-4 w-full"
          />
        </form>
      </div>
    </div>
  );
}
