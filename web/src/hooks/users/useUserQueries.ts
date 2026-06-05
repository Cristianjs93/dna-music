import { useResourceList } from '@/hooks/common/useResourceList';
import { userRepository } from '@/repositories/user.repository';
import type { User } from '@/types/user.types';

export function useUserQueries() {
  return useResourceList<User>(
    () => userRepository.list(),
    'No fue posible cargar usuarios.',
  );
}
