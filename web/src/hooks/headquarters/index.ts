import { useHeadquarterMutations } from './useHeadquarterMutations';
import { useHeadquarterQueries } from './useHeadquarterQueries';

export type { HeadquarterFormValues } from './headquarter.types';

export function useHeadquarters() {
  const { data: headquarters, loading, refresh } = useHeadquarterQueries();
  const { saving, saveHeadquarter, removeHeadquarter } =
    useHeadquarterMutations(refresh);

  return {
    headquarters,
    loading,
    saving,
    refresh,
    saveHeadquarter,
    removeHeadquarter,
  };
}
