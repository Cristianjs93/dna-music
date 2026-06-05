import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import { DnaButton, DnaInputText, DnaLogo, DnaPassword } from '@/components/ui';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { login } from '@/services/auth.service';
import { setCredentials } from '@/store/authSlice';
import { FormField } from '@/components/common/FormField';
import { validationMessages } from '@/utils/errorMessages';
import { getErrorMessage } from '@/utils/format';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const response = await login(values);
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }),
      );
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No fue posible iniciar sesión.'));
    }
  };

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

        <form autoComplete="on" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            label={isSubmitting ? 'Ingresando...' : 'Ingresar'}
            icon="pi pi-arrow-right"
            iconPos="right"
            loading={isSubmitting}
            className="dna-btn-login mt-4 w-full"
          />
        </form>
      </div>
    </div>
  );
}
