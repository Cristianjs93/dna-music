import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { PageHeader } from '@/components/common/PageHeader';
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
import { formatDate, getErrorMessage } from '@/utils/format';

interface StudentFormValues {
  fullName: string;
  email: string;
  phone: string;
  identityCard: string;
  headquarterId: string;
  program: string;
  status: StudentStatus;
  enrollmentDate: Date | null;
}

const statusOptions = [
  { label: 'Activo', value: 'ACTIVO' as StudentStatus },
  { label: 'Inactivo', value: 'INACTIVO' as StudentStatus },
  { label: 'Retirado', value: 'RETIRADO' as StudentStatus },
];

const emptyFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  fullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
};

export default function StudentsPage() {
  const toast = useRef<Toast>(null);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  const [students, setStudents] = useState<Student[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>(emptyFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<StudentFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      identityCard: '',
      headquarterId: '',
      program: '',
      status: 'ACTIVO',
      enrollmentDate: new Date(),
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, hqData] = await Promise.all([
        listStudents(),
        isAdmin ? listHeadquarters() : Promise.resolve([]),
      ]);
      setStudents(studentsData);
      setHeadquarters(hqData);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible cargar estudiantes.'),
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const defaultHeadquarterId = isAdmin
    ? headquarters[0]?.id ?? ''
    : currentUser?.headquarterId ?? '';

  const openCreate = () => {
    setEditing(null);
    reset({
      fullName: '',
      email: '',
      phone: '',
      identityCard: '',
      headquarterId: defaultHeadquarterId,
      program: '',
      status: 'ACTIVO',
      enrollmentDate: new Date(),
    });
    setDialogVisible(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    reset({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      identityCard: student.identityCard,
      headquarterId: student.headquarterId,
      program: student.program,
      status: student.status,
      enrollmentDate: student.enrollmentDate
        ? new Date(student.enrollmentDate)
        : new Date(),
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values: StudentFormValues) => {
    const enrollmentDate = values.enrollmentDate
      ? values.enrollmentDate.toISOString().split('T')[0]
      : undefined;

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
        toast.current?.show({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Estudiante actualizado correctamente.',
        });
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
        toast.current?.show({
          severity: 'success',
          summary: 'Creado',
          detail: 'Estudiante creado correctamente.',
        });
      }
      setDialogVisible(false);
      await loadData();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible guardar el estudiante.'),
      });
    }
  };

  const confirmDelete = (student: Student) => {
    confirmDialog({
      message: `¿Retirar al estudiante ${student.fullName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteStudent(student.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Estudiante retirado correctamente.',
          });
          await loadData();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err, 'No fue posible eliminar el estudiante.'),
          });
        }
      },
    });
  };

  const statusTemplate = (student: Student) => {
    const severity =
      student.status === 'ACTIVO'
        ? 'success'
        : student.status === 'INACTIVO'
          ? 'warning'
          : 'danger';
    return <Tag value={student.status} severity={severity} />;
  };

  const actionsTemplate = (student: Student) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEdit(student)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => confirmDelete(student)}
        tooltip="Eliminar"
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-semibold">Listado de estudiantes</span>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
        />
      </span>
    </div>
  );

  const hqOptions = isAdmin
    ? headquarters.map((hq) => ({
        label: `${hq.name} (${hq.city})`,
        value: hq.id,
      }))
    : currentUser?.headquarter
      ? [
          {
            label: `${currentUser.headquarter.name} (${currentUser.headquarter.city})`,
            value: currentUser.headquarter.id,
          },
        ]
      : [];

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <PageHeader
        title="Estudiantes"
        subtitle={
          isAdmin
            ? 'Gestión de estudiantes en todas las sedes.'
            : `Estudiantes de tu sede: ${currentUser?.headquarter?.name ?? ''}`
        }
        action={
          <Button label="Nuevo estudiante" icon="pi pi-plus" onClick={openCreate} />
        }
      />

      <DataTable
        value={students}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={['fullName', 'email', 'program', 'status']}
        globalFilter={globalFilter}
        onFilter={(e) => setFilters(e.filters)}
        stripedRows
        showGridlines
        emptyMessage="No hay estudiantes registrados."
        dataKey="id"
        header={header}
      >
        <Column field="fullName" header="Nombre" sortable filter filterPlaceholder="Buscar" />
        <Column field="email" header="Correo" sortable filter filterPlaceholder="Buscar" />
        <Column field="phone" header="Teléfono" sortable />
        <Column field="identityCard" header="Documento" sortable />
        <Column
          header="Sede"
          body={(row: Student) => row.headquarter?.name ?? '—'}
          sortable
          sortField="headquarter.name"
        />
        <Column field="program" header="Programa" sortable filter filterPlaceholder="Buscar" />
        <Column field="status" header="Estado" body={statusTemplate} sortable filter />
        <Column
          field="enrollmentDate"
          header="Matrícula"
          body={(row: Student) => formatDate(row.enrollmentDate)}
          sortable
        />
        <Column header="Acciones" body={actionsTemplate} style={{ width: '8rem' }} />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={editing ? 'Editar estudiante' : 'Nuevo estudiante'}
        onHide={() => setDialogVisible(false)}
        className="w-full max-w-2xl"
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-dna-muted">Nombre completo</label>
            <InputText className="w-full" {...register('fullName', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Correo</label>
            <InputText className="w-full" type="email" {...register('email', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Teléfono</label>
            <InputText className="w-full" {...register('phone', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Documento</label>
            <InputText className="w-full" {...register('identityCard', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Programa</label>
            <InputText className="w-full" {...register('program', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Sede</label>
            <Controller
              name="headquarterId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Dropdown
                  className="w-full"
                  options={hqOptions}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  disabled={!isAdmin}
                  placeholder="Seleccionar sede"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Estado</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Dropdown
                  className="w-full"
                  options={statusOptions}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Fecha de matrícula</label>
            <Controller
              name="enrollmentDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  className="w-full"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value ?? null)}
                  dateFormat="yy-mm-dd"
                  showIcon
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setDialogVisible(false)}
            />
            <Button type="submit" label="Guardar" loading={isSubmitting} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
