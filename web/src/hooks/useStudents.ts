import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { listHeadquarters } from '@/services/headquarters.service';
import {
  createStudent,
  deleteStudent,
  listStudents,
  setStudentStatus,
  updateStudent,
} from '@/services/students.service';
import type {
  Headquarter,
  Student,
  StudentStatus,
} from '@/types/api.types';
import { useToastContext } from '@/context/toast.context';
import { getErrorMessage } from '@/utils/format';

export interface StudentFormValues {
  fullName: string;
  email: string;
  phone: string;
  identityCard: string;
  headquarterId: string;
  program: string;
  status: StudentStatus;
  enrollmentDate: Date | null;
}

export function useStudents() {
  const { showError, showSuccess } = useToastContext();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const [students, setStudents] = useState<Student[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeHeadquarters = useMemo(
    () => headquarters.filter((hq) => hq.isActive),
    [headquarters],
  );

  const defaultHeadquarterId = isAdmin
    ? activeHeadquarters[0]?.id ?? ''
    : currentUser?.headquarterId ?? '';

  const headquarterOptions = useMemo(() => {
    if (isAdmin) {
      return activeHeadquarters.map((hq) => ({
        label: `${hq.name} (${hq.city})`,
        value: hq.id,
      }));
    }
    if (currentUser?.headquarter) {
      return [
        {
          label: `${currentUser.headquarter.name} (${currentUser.headquarter.city})`,
          value: currentUser.headquarter.id,
        },
      ];
    }
    return [];
  }, [isAdmin, activeHeadquarters, currentUser]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, hqData] = await Promise.all([
        listStudents(),
        isAdmin ? listHeadquarters() : Promise.resolve([]),
      ]);
      setStudents(studentsData);
      setHeadquarters(hqData);
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible cargar estudiantes.'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveStudent = async (
    editing: Student | null,
    values: StudentFormValues,
  ): Promise<boolean> => {
    const enrollmentDate = values.enrollmentDate
      ? values.enrollmentDate.toISOString().split('T')[0]
      : undefined;

    setSaving(true);
    try {
      if (editing) {
        await updateStudent(editing.id, {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          identityCard: values.identityCard,
          program: values.program,
          enrollmentDate,
          headquarterId: isAdmin ? values.headquarterId : undefined,
        });
        if (editing.status !== values.status) {
          if (values.status === 'ACTIVO') {
            await setStudentStatus(editing.id, true);
          } else if (values.status === 'INACTIVO') {
            await setStudentStatus(editing.id, false);
          }
        }
        showSuccess('Estudiante actualizado correctamente.', 'Actualizado');
      } else {
        await createStudent({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          identityCard: values.identityCard,
          headquarterId: values.headquarterId,
          program: values.program,
          status: values.status,
          enrollmentDate,
        });
        showSuccess('Estudiante creado correctamente.', 'Creado');
      }
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible guardar el estudiante.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (student: Student): Promise<boolean> => {
    try {
      await deleteStudent(student.id);
      showSuccess('Estudiante retirado correctamente.', 'Eliminado');
      await refresh();
      return true;
    } catch (err) {
      showError(getErrorMessage(err, 'No fue posible eliminar el estudiante.'));
      return false;
    }
  };

  return {
    students,
    loading,
    saving,
    isAdmin,
    currentUser,
    defaultHeadquarterId,
    headquarterOptions,
    refresh,
    saveStudent,
    removeStudent,
  };
}
