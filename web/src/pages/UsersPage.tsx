import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { FormField } from '@/components/common/FormField';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSearchInput } from '@/components/common/TableSearchInput';
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
import { confirmDelete } from '@/utils/confirmDelete';
import { validationMessages } from '@/utils/errorMessages';
import { formatDate, getErrorMessage } from '@/utils/format';

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  headquarterId: string | null;
}

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
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
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
    formState: { isSubmitting, errors },
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
  const activeHeadquarters = headquarters.filter((hq) => hq.isActive);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, hqData] = await Promise.all([
        listUsers(),
        listHeadquarters(),
      ]);
      setUsers(usersData);
      setHeadquarters(hqData);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible cargar usuarios.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          name: values.name,
          email: values.email,
          role: values.role,
          headquarterId:
            values.role === 'OPERADOR' ? values.headquarterId ?? undefined : null,
        };
        await updateUser(editingUser.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Usuario actualizado correctamente.',
        });
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
        toast.current?.show({
          severity: 'success',
          summary: 'Creado',
          detail: 'Usuario creado correctamente.',
        });
      }
      setDialogVisible(false);
      await loadData();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible guardar el usuario.'),
      });
    }
  };

  const handleDelete = (user: User) => {
    confirmDelete({
      entityLabel: `al usuario ${user.name}`,
      onAccept: async () => {
        try {
          await deleteUser(user.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Usuario eliminado correctamente.',
          });
          await loadData();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err, 'No fue posible eliminar el usuario.'),
          });
        }
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
      <Toast ref={toast} />
      <ConfirmDialog />
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas internas y roles de acceso."
        action={
          <Button
            label="Nuevo usuario"
            icon="pi pi-plus"
            className="btn-dna-primary"
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
            <InputText
              id="user-name"
              className="w-full"
              autoComplete="off"
              {...register('name', { required: validationMessages.required })}
            />
          </FormField>
          <FormField label="Correo" error={errors.email?.message} htmlFor="user-email">
            <InputText
              id="user-email"
              className="w-full"
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
                  <Password
                    inputId="user-password"
                    className="w-full"
                    inputClassName="w-full"
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
                <Dropdown
                  className="w-full"
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
                  <Dropdown
                    className="w-full"
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
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setDialogVisible(false)}
            />
            <Button type="submit" label="Guardar" className="btn-dna-primary" loading={isSubmitting} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
