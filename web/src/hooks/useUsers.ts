import { useCallback, useEffect, useMemo, useState } from 'react';
import { listHeadquarters } from '@/services/headquarters.service';
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '@/services/users.service';
import type {
  CreateUserPayload,
  Headquarter,
  Role,
  UpdateUserPayload,
  User,
} from '@/types/api.types';
import { getErrorMessage } from '@/utils/format';
import { useToast } from './useToast';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  headquarterId: string | null;
}

export function useUsers() {
  const { toastRef, showError, showSuccess } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeHeadquarters = useMemo(
    () => headquarters.filter((hq) => hq.isActive),
    [headquarters],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, hqData] = await Promise.all([
        listUsers(),
        listHeadquarters(),
      ]);
      setUsers(usersData);
      setHeadquarters(hqData);
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible cargar usuarios.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveUser = async (
    editing: User | null,
    values: UserFormValues,
  ): Promise<boolean> => {
    setSaving(true);
    try {
      if (editing) {
        const payload: UpdateUserPayload = {
          name: values.name,
          email: values.email,
          role: values.role,
          headquarterId:
            values.role === 'OPERADOR' ? values.headquarterId ?? undefined : null,
        };
        await updateUser(editing.id, payload);
        showSuccess('Usuario actualizado correctamente.', 'Actualizado');
      } else {
        const payload: CreateUserPayload = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          headquarterId:
            values.role === 'OPERADOR'
              ? values.headquarterId ?? undefined
              : undefined,
        };
        await createUser(payload);
        showSuccess('Usuario creado correctamente.', 'Creado');
      }
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible guardar el usuario.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (user: User): Promise<boolean> => {
    try {
      await deleteUser(user.id);
      showSuccess('Usuario eliminado correctamente.', 'Eliminado');
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible eliminar el usuario.'));
      return false;
    }
  };

  return {
    users,
    headquarters,
    activeHeadquarters,
    loading,
    saving,
    refresh,
    saveUser,
    removeUser,
    toastRef,
  };
}
