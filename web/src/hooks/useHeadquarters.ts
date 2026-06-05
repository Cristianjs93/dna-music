import { useCallback, useEffect, useState } from 'react';
import {
  createHeadquarter,
  deleteHeadquarter,
  listHeadquarters,
  setHeadquarterStatus,
  updateHeadquarter,
} from '@/services/headquarters.service';
import type { Headquarter } from '@/types/api.types';
import { useToastContext } from '@/context/toast.context';
import { getErrorMessage } from '@/utils/format';

export interface HeadquarterFormValues {
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

export function useHeadquarters() {
  const { showError, showSuccess } = useToastContext();
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHeadquarters();
      setHeadquarters(data);
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible cargar sedes.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveHeadquarter = async (
    editing: Headquarter | null,
    values: HeadquarterFormValues,
  ): Promise<boolean> => {
    setSaving(true);
    try {
      if (editing) {
        await updateHeadquarter(editing.id, {
          name: values.name,
          city: values.city,
          address: values.address,
        });
        if (editing.isActive !== values.isActive) {
          await setHeadquarterStatus(editing.id, values.isActive);
        }
        showSuccess('Sede actualizada correctamente.', 'Actualizado');
      } else {
        await createHeadquarter(values);
        showSuccess('Sede creada correctamente.', 'Creado');
      }
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible guardar la sede.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeHeadquarter = async (hq: Headquarter): Promise<boolean> => {
    try {
      await deleteHeadquarter(hq.id);
      showSuccess('Sede eliminada correctamente.', 'Eliminado');
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible eliminar la sede.'));
      return false;
    }
  };

  return {
    headquarters,
    loading,
    saving,
    refresh,
    saveHeadquarter,
    removeHeadquarter,
  };
}
