import { useMemo } from 'react';
import { useResourceList } from '@/hooks/common/useResourceList';
import { headquarterRepository } from '@/repositories/headquarter.repository';
import type { Headquarter } from '@/types/headquarter.types';

export function useActiveHeadquarters(enabled = true) {
  const { data, loading, refresh } = useResourceList<Headquarter>(
    headquarterRepository.list,
    'No fue posible cargar sedes.',
    enabled,
  );

  const activeHeadquarters = useMemo(
    () => data.filter((hq) => hq.isActive),
    [data],
  );

  const headquarterOptions = useMemo(
    () =>
      activeHeadquarters.map((hq) => ({
        label: `${hq.name} (${hq.city})`,
        value: hq.id,
      })),
    [activeHeadquarters],
  );

  return {
    headquarters: data,
    activeHeadquarters,
    headquarterOptions,
    loading,
    refresh,
  };
}
