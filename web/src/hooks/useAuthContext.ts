import { useMemo } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useAuthContext() {
  const currentUser = useAppSelector((state) => state.auth.user);

  return useMemo(
    () => ({
      currentUser,
      isAdmin: currentUser?.role === 'ADMIN',
      headquarterId: currentUser?.headquarterId ?? null,
    }),
    [currentUser],
  );
}
