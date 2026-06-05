import { useState } from 'react';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { PageHeader } from '@/components/common/PageHeader';
import { CrudDataTable } from '@/components/crud/CrudDataTable';
import { createGlobalFilter } from '@/components/crud/tableFilters';
import { TableActionsColumn } from '@/components/crud/TableActionsColumn';
import { StudentFormDialog } from '@/components/students/StudentFormDialog';
import { DnaButton } from '@/components/ui';
import { useStudents } from '@/hooks/useStudents';
import type { StudentFormValues } from '@/hooks/students/student.types';
import type { Student, StudentStatus } from '@/types/student.types';
import { confirmDelete } from '@/utils/confirmDelete';
import { formatDate } from '@/utils/format';

const statusLabels: Record<StudentStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  RETIRADO: 'Retirado',
};

const studentFilters = createGlobalFilter(['fullName', 'email', 'status']);

export default function StudentsPage() {
  const {
    students,
    loading,
    saving,
    isAdmin,
    currentUser,
    defaultHeadquarterId,
    headquarterOptions,
    saveStudent,
    removeStudent,
  } = useStudents();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [formValues, setFormValues] = useState<StudentFormValues>({
    fullName: '',
    email: '',
    phone: '',
    identityCard: '',
    headquarterId: '',
    program: '',
    status: 'ACTIVO',
    enrollmentDate: new Date(),
  });

  const openCreate = () => {
    setEditing(null);
    setFormValues({
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
    setFormValues({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      identityCard: student.identityCard,
      headquarterId: student.headquarterId,
      program: student.program,
      status: student.status,
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate) : new Date(),
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values: StudentFormValues) => {
    const success = await saveStudent(editing, values);
    if (success) setDialogVisible(false);
  };

  const handleDelete = (student: Student) => {
    confirmDelete({
      entityLabel: `al estudiante ${student.fullName}`,
      onAccept: async () => {
        await removeStudent(student);
      },
    });
  };

  return (
    <div>
      <ConfirmDialog />
      <PageHeader
        title="Estudiantes"
        subtitle={
          isAdmin
            ? 'Gestión de estudiantes en todas las sedes.'
            : `Estudiantes de tu sede: ${currentUser?.headquarter?.name ?? ''}`
        }
        action={
          <DnaButton
            variant="primary"
            label="Nuevo estudiante"
            icon="pi pi-plus"
            onClick={openCreate}
          />
        }
      />
      <CrudDataTable
        value={students}
        loading={loading}
        title="Listado de estudiantes"
        emptyMessage="No hay estudiantes registrados."
        globalFilterFields={['fullName', 'email', 'program', 'status']}
        initialFilters={studentFilters}
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
        <Column
          field="status"
          header="Estado"
          body={(student: Student) => {
            const severity =
              student.status === 'ACTIVO'
                ? 'success'
                : student.status === 'INACTIVO'
                  ? 'warning'
                  : 'danger';
            return (
              <div className="flex justify-center">
                <Tag value={statusLabels[student.status]} severity={severity} />
              </div>
            );
          }}
          sortable
          filter
          bodyClassName="text-center"
        />
        <Column
          field="enrollmentDate"
          header="Matrícula"
          body={(row: Student) => formatDate(row.enrollmentDate)}
          sortable
        />
        <Column
          header="Acciones"
          body={(row: Student) => (
            <TableActionsColumn row={row} onEdit={openEdit} onDelete={handleDelete} />
          )}
          bodyClassName="text-center"
          style={{ width: '8rem' }}
        />
      </CrudDataTable>
      <StudentFormDialog
        visible={dialogVisible}
        editing={editing}
        initialValues={formValues}
        saving={saving}
        isAdmin={isAdmin}
        headquarterOptions={headquarterOptions}
        onHide={() => setDialogVisible(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
