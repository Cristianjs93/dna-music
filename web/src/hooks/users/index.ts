import { useCallback } from 'react';
import { useActiveHeadquarters } from '@/hooks/useActiveHeadquarters';
import { useUserMutations } from './useUserMutations';
import { useUserQueries } from './useUserQueries';

export type { UserFormValues } from './user.types';

export function useUsers() {
  const { data: users, loading, refresh } = useUserQueries();
  const { activeHeadquarters, refresh: refreshHeadquarters } =
    useActiveHeadquarters();
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), refreshHeadquarters()]);
  }, [refresh, refreshHeadquarters]);

  const { saving, saveUser, removeUser } = useUserMutations(refreshAll);

  return {
    users,
    activeHeadquarters,
    loading,
    saving,
    refresh,
    saveUser,
    removeUser,
  };
}
