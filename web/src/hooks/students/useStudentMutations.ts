import { useMutationAction } from '@/hooks/common/useMutationAction';
import {
  toCreateStudentPayload,
  toUpdateStudentPayload,
} from '@/mappers/student.mapper';
import { studentRepository } from '@/repositories/student.repository';
import type { Student } from '@/types/student.types';
import type { StudentFormValues } from './student.types';

export function useStudentMutations(
  refresh: () => Promise<void>,
  isAdmin: boolean,
) {
  const { saving, runMutation } = useMutationAction();

  const saveStudent = async (
    editing: Student | null,
    values: StudentFormValues,
  ): Promise<boolean> => {
    const success = await runMutation(
      async () => {
        if (editing) {
          await studentRepository.update(
            editing.id,
            toUpdateStudentPayload(values, isAdmin),
          );
          if (editing.status !== values.status) {
            if (values.status === 'ACTIVO') {
              await studentRepository.setStatus(editing.id, true);
            } else if (values.status === 'INACTIVO') {
              await studentRepository.setStatus(editing.id, false);
            }
          }
        } else {
          await studentRepository.create(toCreateStudentPayload(values));
        }
        await refresh();
      },
      editing
        ? {
            success: 'Estudiante actualizado correctamente.',
            error: 'No fue posible guardar el estudiante.',
            summary: 'Actualizado',
          }
        : {
            success: 'Estudiante creado correctamente.',
            error: 'No fue posible guardar el estudiante.',
            summary: 'Creado',
          },
    );
    return success;
  };

  const removeStudent = async (student: Student): Promise<boolean> =>
    runMutation(
      async () => {
        await studentRepository.delete(student.id);
        await refresh();
      },
      {
        success: 'Estudiante retirado correctamente.',
        error: 'No fue posible eliminar el estudiante.',
        summary: 'Eliminado',
      },
      false,
    );

  return { saving, saveStudent, removeStudent };
}
