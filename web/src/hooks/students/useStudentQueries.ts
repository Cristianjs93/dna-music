import { useResourceList } from '@/hooks/common/useResourceList';
import { studentRepository } from '@/repositories/student.repository';
import type { Student } from '@/types/student.types';

export function useStudentQueries() {
  return useResourceList<Student>(
    () => studentRepository.list(),
    'No fue posible cargar estudiantes.',
  );
}
