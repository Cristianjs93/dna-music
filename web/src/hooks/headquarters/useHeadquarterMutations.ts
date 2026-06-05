import { useMutationAction } from '@/hooks/common/useMutationAction';
import {
  toCreateHeadquarterPayload,
  toUpdateHeadquarterPayload,
} from '@/mappers/headquarter.mapper';
import { headquarterRepository } from '@/repositories/headquarter.repository';
import type { Headquarter } from '@/types/headquarter.types';
import type { HeadquarterFormValues } from './headquarter.types';

export function useHeadquarterMutations(refresh: () => Promise<void>) {
  const { saving, runMutation } = useMutationAction();

  const saveHeadquarter = async (
    editing: Headquarter | null,
    values: HeadquarterFormValues,
  ): Promise<boolean> => {
    const success = await runMutation(
      async () => {
        if (editing) {
          await headquarterRepository.update(
            editing.id,
            toUpdateHeadquarterPayload(values),
          );
          if (editing.isActive !== values.isActive) {
            await headquarterRepository.setStatus(editing.id, values.isActive);
          }
        } else {
          await headquarterRepository.create(toCreateHeadquarterPayload(values));
        }
        await refresh();
      },
      editing
        ? {
            success: 'Sede actualizada correctamente.',
            error: 'No fue posible guardar la sede.',
            summary: 'Actualizado',
          }
        : {
            success: 'Sede creada correctamente.',
            error: 'No fue posible guardar la sede.',
            summary: 'Creado',
          },
    );
    return success;
  };

  const removeHeadquarter = async (hq: Headquarter): Promise<boolean> =>
    runMutation(
      async () => {
        await headquarterRepository.delete(hq.id);
        await refresh();
      },
      {
        success: 'Sede eliminada correctamente.',
        error: 'No fue posible eliminar la sede.',
        summary: 'Eliminado',
      },
      false,
    );

  return { saving, saveHeadquarter, removeHeadquarter };
}
