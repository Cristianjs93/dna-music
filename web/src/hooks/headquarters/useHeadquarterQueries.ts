import { useResourceList } from '@/hooks/common/useResourceList';
import { headquarterRepository } from '@/repositories/headquarter.repository';
import type { Headquarter } from '@/types/headquarter.types';

export function useHeadquarterQueries() {
  return useResourceList<Headquarter>(
    headquarterRepository.list,
    'No fue posible cargar sedes.',
  );
}
