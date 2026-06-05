import { useActiveHeadquarters } from '@/hooks/useActiveHeadquarters';
import { useUserMutations } from './useUserMutations';
import { useUserQueries } from './useUserQueries';

export type { UserFormValues } from './user.types';

export function useUsers() {
  const { data: users, loading, refresh } = useUserQueries();
  const { activeHeadquarters, refresh: refreshHeadquarters } =
    useActiveHeadquarters();
  const { saving, saveUser, removeUser } = useUserMutations(async () => {
    await Promise.all([refresh(), refreshHeadquarters()]);
  });

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
