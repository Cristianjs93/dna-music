import { useState } from 'react';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { PageHeader } from '@/components/common/PageHeader';
import { CrudDataTable } from '@/components/crud/CrudDataTable';
import { createGlobalFilter } from '@/components/crud/tableFilters';
import { TableActionsColumn } from '@/components/crud/TableActionsColumn';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { DnaButton } from '@/components/ui';
import { useUsers } from '@/hooks/useUsers';
import type { UserFormValues } from '@/hooks/users/user.types';
import type { User } from '@/types/user.types';
import { confirmDelete } from '@/utils/confirmDelete';
import { formatDate } from '@/utils/format';

const emptyUserValues: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'OPERADOR',
  headquarterId: null,
};

const userFilters = createGlobalFilter(['name', 'email', 'role']);

export default function UsersPage() {
  const { users, activeHeadquarters, loading, saving, saveUser, removeUser } = useUsers();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(emptyUserValues);

  const openCreate = () => {
    setEditingUser(null);
    setFormValues({
      ...emptyUserValues,
      headquarterId: activeHeadquarters[0]?.id ?? null,
    });
    setDialogVisible(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormValues({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      headquarterId: user.headquarterId,
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    const success = await saveUser(editingUser, values);
    if (success) setDialogVisible(false);
  };

  const handleDelete = (user: User) => {
    confirmDelete({
      entityLabel: `al usuario ${user.name}`,
      onAccept: async () => {
        await removeUser(user);
      },
    });
  };

  return (
    <div>
      <ConfirmDialog />
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas internas y roles de acceso."
        action={
          <DnaButton variant="primary" label="Nuevo usuario" icon="pi pi-plus" onClick={openCreate} />
        }
      />
      <CrudDataTable
        value={users}
        loading={loading}
        title="Listado de usuarios"
        emptyMessage="No hay usuarios registrados."
        globalFilterFields={['name', 'email', 'role']}
        initialFilters={userFilters}
      >
        <Column field="name" header="Nombre" sortable filter filterPlaceholder="Buscar" />
        <Column field="email" header="Correo" sortable filter filterPlaceholder="Buscar" />
        <Column field="role" header="Rol" sortable filter filterPlaceholder="Rol" />
        <Column
          header="Sede"
          body={(row: User) => row.headquarter?.name ?? '—'}
          sortable
          sortField="headquarter.name"
        />
        <Column
          field="createdAt"
          header="Creado"
          body={(row: User) => formatDate(row.createdAt)}
          sortable
        />
        <Column
          header="Acciones"
          body={(row: User) => (
            <TableActionsColumn row={row} onEdit={openEdit} onDelete={handleDelete} />
          )}
          bodyClassName="text-center"
          style={{ width: '8rem' }}
        />
      </CrudDataTable>
      <UserFormDialog
        visible={dialogVisible}
        editing={editingUser}
        initialValues={formValues}
        saving={saving}
        activeHeadquarters={activeHeadquarters}
        onHide={() => setDialogVisible(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
