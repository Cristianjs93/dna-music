import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { FormField } from '@/components/common/FormField';
import { DnaButton, DnaInputText } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSearchInput } from '@/components/common/TableSearchInput';
import {
  createHeadquarter,
  deleteHeadquarter,
  listHeadquarters,
  setHeadquarterStatus,
  updateHeadquarter,
} from '@/services/headquarters.service';
import type { Headquarter } from '@/types/api.types';
import { confirmDelete } from '@/utils/confirmDelete';
import { validationMessages } from '@/utils/errorMessages';
import { formatDate, getErrorMessage } from '@/utils/format';

interface HeadquarterFormValues {
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

const emptyFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  city: { value: null, matchMode: FilterMatchMode.CONTAINS },
};

export default function HeadquartersPage() {
  const toast = useRef<Toast>(null);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Headquarter | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>(emptyFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<HeadquarterFormValues>({
    defaultValues: {
      name: '',
      city: '',
      address: '',
      isActive: true,
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHeadquarters();
      setHeadquarters(data);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible cargar sedes.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', city: '', address: '', isActive: true });
    setDialogVisible(true);
  };

  const openEdit = (hq: Headquarter) => {
    setEditing(hq);
    reset({
      name: hq.name,
      city: hq.city,
      address: hq.address,
      isActive: hq.isActive,
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values: HeadquarterFormValues) => {
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
        toast.current?.show({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Sede actualizada correctamente.',
        });
      } else {
        await createHeadquarter(values);
        toast.current?.show({
          severity: 'success',
          summary: 'Creado',
          detail: 'Sede creada correctamente.',
        });
      }
      setDialogVisible(false);
      await loadData();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err, 'No fue posible guardar la sede.'),
      });
    }
  };

  const handleDelete = (hq: Headquarter) => {
    confirmDelete({
      entityLabel: `la sede ${hq.name}`,
      onAccept: async () => {
        try {
          await deleteHeadquarter(hq.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Sede eliminada correctamente.',
          });
          await loadData();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err, 'No fue posible eliminar la sede.'),
          });
        }
      },
    });
  };

  const statusTemplate = (hq: Headquarter) => (
    <div className="flex justify-center">
      <Tag
        value={hq.isActive ? 'Activa' : 'Inactiva'}
        severity={hq.isActive ? 'success' : 'danger'}
      />
    </div>
  );

  const actionsTemplate = (hq: Headquarter) => (
    <div className="flex justify-center gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEdit(hq)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => handleDelete(hq)}
        tooltip="Eliminar"
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-semibold">Listado de sedes</span>
      <TableSearchInput value={globalFilter} onChange={setGlobalFilter} />
    </div>
  );

  const formKey = editing?.id ?? 'create';

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <PageHeader
        title="Sedes"
        subtitle="Administración de sedes y ubicaciones."
        action={
          <DnaButton
            variant="primary"
            label="Nueva sede"
            icon="pi pi-plus"
            onClick={openCreate}
          />
        }
      />

      <DataTable
        value={headquarters}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={['name', 'city', 'address']}
        globalFilter={globalFilter}
        onFilter={(e) => setFilters(e.filters)}
        stripedRows
        showGridlines
        emptyMessage="No hay sedes registradas."
        dataKey="id"
        header={header}
      >
        <Column field="name" header="Nombre" sortable filter filterPlaceholder="Buscar" />
        <Column field="city" header="Ciudad" sortable filter filterPlaceholder="Buscar" />
        <Column field="address" header="Dirección" sortable />
        <Column
          header="Estado"
          body={statusTemplate}
          sortable
          sortField="isActive"
          bodyClassName="text-center"
        />
        <Column
          field="createdAt"
          header="Creado"
          body={(row: Headquarter) => formatDate(row.createdAt)}
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
        header={editing ? 'Editar sede' : 'Nueva sede'}
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
          <FormField label="Nombre" error={errors.name?.message} htmlFor="hq-name">
            <DnaInputText
              id="hq-name"
              autoComplete="off"
              {...register('name', { required: validationMessages.required })}
            />
          </FormField>
          <FormField label="Ciudad" error={errors.city?.message} htmlFor="hq-city">
            <DnaInputText
              id="hq-city"
              autoComplete="off"
              {...register('city', { required: validationMessages.required })}
            />
          </FormField>
          <FormField label="Dirección" error={errors.address?.message} htmlFor="hq-address">
            <DnaInputText
              id="hq-address"
              autoComplete="off"
              {...register('address', { required: validationMessages.required })}
            />
          </FormField>
          <div className="flex items-center gap-3">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <InputSwitch checked={field.value} onChange={(e) => field.onChange(e.value)} />
              )}
            />
            <span className="text-sm text-dna-muted">Sede activa</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DnaButton
              type="button"
              variant="secondary"
              label="Cancelar"
              onClick={() => setDialogVisible(false)}
            />
            <DnaButton type="submit" variant="primary" label="Guardar" loading={isSubmitting} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
