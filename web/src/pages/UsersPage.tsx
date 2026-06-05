import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSearchInput } from '@/components/common/TableSearchInput';
import { DnaButton, DnaDropdown, DnaInputText, DnaPassword } from '@/components/ui';
import { useUsers, type UserFormValues } from '@/hooks/useUsers';
import type { Role, User } from '@/types/api.types';
import { confirmDelete } from '@/utils/confirmDelete';
import { validationMessages } from '@/utils/errorMessages';
import { formatDate } from '@/utils/format';

const roleOptions = [
  { label: 'Administrador', value: 'ADMIN' as Role },
  { label: 'Operador', value: 'OPERADOR' as Role },
];

const emptyFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  role: { value: null, matchMode: FilterMatchMode.EQUALS },
};

export default function UsersPage() {
  const {
    users,
    activeHeadquarters,
    loading,
    saving,
    saveUser,
    removeUser,
    toastRef,
  } = useUsers();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>(emptyFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'OPERADOR',
      headquarterId: null,
    },
  });

  const selectedRole = watch('role');

  const openCreate = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'OPERADOR',
      headquarterId: activeHeadquarters[0]?.id ?? null,
    });
    setDialogVisible(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    reset({
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

  const actionsTemplate = (user: User) => (
    <div className="flex justify-center gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEdit(user)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => handleDelete(user)}
        tooltip="Eliminar"
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-semibold">Listado de usuarios</span>
      <TableSearchInput value={globalFilter} onChange={setGlobalFilter} />
    </div>
  );

  const formKey = editingUser?.id ?? 'create';

  return (
    <div>
      <Toast ref={toastRef} />
      <ConfirmDialog />
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas internas y roles de acceso."
        action={
          <DnaButton
            variant="primary"
            label="Nuevo usuario"
            icon="pi pi-plus"
            onClick={openCreate}
          />
        }
      />

      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={['name', 'email', 'role']}
        globalFilter={globalFilter}
        onFilter={(e) => setFilters(e.filters)}
        stripedRows
        showGridlines
        emptyMessage="No hay usuarios registrados."
        dataKey="id"
        header={header}
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
          body={actionsTemplate}
          bodyClassName="text-center"
          style={{ width: '8rem' }}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        onHide={() => setDialogVisible(false)}
        className="w-full max-w-lg"
        modal
      >
        <form
          key={formKey}
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Nombre" error={errors.name?.message} htmlFor="user-name">
            <DnaInputText
              id="user-name"
              autoComplete="off"
              {...register('name', { required: validationMessages.required })}
            />
          </FormField>
          <FormField label="Correo" error={errors.email?.message} htmlFor="user-email">
            <DnaInputText
              id="user-email"
              type="email"
              autoComplete="off"
              {...register('email', {
                required: validationMessages.required,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: validationMessages.email,
                },
              })}
            />
          </FormField>
          {!editingUser && (
            <FormField label="Contraseña" error={errors.password?.message} htmlFor="user-password">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: validationMessages.required,
                  minLength: {
                    value: 8,
                    message: validationMessages.minLength(8),
                  },
                }}
                render={({ field }) => (
                  <DnaPassword
                    inputId="user-password"
                    toggleMask
                    feedback={false}
                    autoComplete="new-password"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </FormField>
          )}
          <FormField label="Rol" error={errors.role?.message}>
            <Controller
              name="role"
              control={control}
              rules={{ required: validationMessages.required }}
              render={({ field }) => (
                <DnaDropdown
                  options={roleOptions}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                />
              )}
            />
          </FormField>
          {selectedRole === 'OPERADOR' && (
            <FormField label="Sede" error={errors.headquarterId?.message}>
              <Controller
                name="headquarterId"
                control={control}
                rules={{ required: validationMessages.required }}
                render={({ field }) => (
                  <DnaDropdown
                    options={activeHeadquarters.map((hq) => ({
                      label: `${hq.name} (${hq.city})`,
                      value: hq.id,
                    }))}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    placeholder="Seleccionar sede"
                  />
                )}
              />
            </FormField>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <DnaButton
              type="button"
              variant="secondary"
              label="Cancelar"
              onClick={() => setDialogVisible(false)}
            />
            <DnaButton type="submit" variant="primary" label="Guardar" loading={saving} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
