import { useMutationAction } from '@/hooks/common/useMutationAction';
import {
  toCreateUserPayload,
  toUpdateUserPayload,
} from '@/mappers/user.mapper';
import { userRepository } from '@/repositories/user.repository';
import type { User } from '@/types/user.types';
import type { UserFormValues } from './user.types';

export function useUserMutations(refresh: () => Promise<void>) {
  const { saving, runMutation } = useMutationAction();

  const saveUser = async (
    editing: User | null,
    values: UserFormValues,
  ): Promise<boolean> => {
    const success = await runMutation(
      async () => {
        if (editing) {
          await userRepository.update(editing.id, toUpdateUserPayload(values));
        } else {
          await userRepository.create(toCreateUserPayload(values));
        }
        await refresh();
      },
      editing
        ? {
            success: 'Usuario actualizado correctamente.',
            error: 'No fue posible guardar el usuario.',
            summary: 'Actualizado',
          }
        : {
            success: 'Usuario creado correctamente.',
            error: 'No fue posible guardar el usuario.',
            summary: 'Creado',
          },
    );
    return success;
  };

  const removeUser = async (user: User): Promise<boolean> =>
    runMutation(
      async () => {
        await userRepository.delete(user.id);
        await refresh();
      },
      {
        success: 'Usuario eliminado correctamente.',
        error: 'No fue posible eliminar el usuario.',
        summary: 'Eliminado',
      },
      false,
    );

  return { saving, saveUser, removeUser };
}
