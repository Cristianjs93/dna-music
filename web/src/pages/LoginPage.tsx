import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { login } from '@/services/auth.service';
import { setCredentials } from '@/store/authSlice';
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
    formState: { isSubmitting },
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
          <img
            src="/logo-horizontal-negro.avif"
            alt="DNA Music"
            className="mx-auto h-12 w-auto"
          />
          <h1 className="mt-6 text-xl font-bold uppercase tracking-wide text-white">
            Acceso interno
          </h1>
          <p className="mt-2 text-sm text-dna-muted">
            Ingresa con las credenciales asignadas por el administrador.
          </p>
        </div>

        {error && <Message severity="error" text={error} className="mb-4 w-full" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase text-dna-muted">
              Correo
            </label>
            <InputText
              id="email"
              type="email"
              className="w-full border-0 border-b border-dna-border bg-transparent"
              {...register('email', { required: true })}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase text-dna-muted">
              Contraseña
            </label>
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Password
                  inputId="password"
                  toggleMask
                  feedback={false}
                  className="w-full"
                  inputClassName="w-full border-0 border-b border-dna-border bg-transparent"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            label={isSubmitting ? 'Ingresando...' : 'Ingresar'}
            icon="pi pi-arrow-right"
            iconPos="right"
            loading={isSubmitting}
            className="mt-2 w-full"
          />
        </form>
      </div>
    </div>
  );
}
