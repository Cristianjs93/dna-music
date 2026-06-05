import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { login } from '@/services/auth.service';
import { setCredentials } from '@/store/authSlice';
import { getErrorMessage } from '@/utils/format';

export interface LoginFormValues {
  email: string;
  password: string;
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginUser = async (values: LoginFormValues): Promise<void> => {
    setError(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, error, loading };
}
