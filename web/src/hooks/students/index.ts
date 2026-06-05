import { useMemo } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useActiveHeadquarters } from '@/hooks/useActiveHeadquarters';
import { useStudentMutations } from './useStudentMutations';
import { useStudentQueries } from './useStudentQueries';

export type { StudentFormValues } from './student.types';

export function useStudents() {
  const { currentUser, isAdmin } = useAuthContext();
  const { data: students, loading, refresh } = useStudentQueries();
  const { headquarterOptions: adminOptions } = useActiveHeadquarters(isAdmin);
  const { saving, saveStudent, removeStudent } = useStudentMutations(
    refresh,
    isAdmin,
  );

  const headquarterOptions = useMemo(() => {
    if (isAdmin) return adminOptions;
    if (currentUser?.headquarter) {
      return [
        {
          label: `${currentUser.headquarter.name} (${currentUser.headquarter.city})`,
          value: currentUser.headquarter.id,
        },
      ];
    }
    return [];
  }, [isAdmin, adminOptions, currentUser]);

  const defaultHeadquarterId = isAdmin
    ? adminOptions[0]?.value ?? ''
    : currentUser?.headquarterId ?? '';

  return {
    students,
    loading,
    saving,
    isAdmin,
    currentUser,
    defaultHeadquarterId,
    headquarterOptions,
    refresh,
    saveStudent,
    removeStudent,
  };
}
