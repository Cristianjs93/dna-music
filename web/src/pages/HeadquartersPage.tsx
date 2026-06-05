import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { PageHeader } from '@/components/common/PageHeader';
import {
  createHeadquarter,
  deleteHeadquarter,
  listHeadquarters,
  setHeadquarterStatus,
  updateHeadquarter,
} from '@/services/headquarters.service';
import type { Headquarter } from '@/types/api.types';
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
    formState: { isSubmitting },
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

  const confirmDelete = (hq: Headquarter) => {
    confirmDialog({
      message: `¿Eliminar la sede ${hq.name}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
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
    <Tag
      value={hq.isActive ? 'Activa' : 'Inactiva'}
      severity={hq.isActive ? 'success' : 'danger'}
    />
  );

  const actionsTemplate = (hq: Headquarter) => (
    <div className="flex gap-2">
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
        onClick={() => confirmDelete(hq)}
        tooltip="Eliminar"
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-semibold">Listado de sedes</span>
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

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <PageHeader
        title="Sedes"
        subtitle="Administración de sedes y ubicaciones."
        action={<Button label="Nueva sede" icon="pi pi-plus" onClick={openCreate} />}
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
        <Column header="Estado" body={statusTemplate} sortable sortField="isActive" />
        <Column
          field="createdAt"
          header="Creado"
          body={(row: Headquarter) => formatDate(row.createdAt)}
          sortable
        />
        <Column header="Acciones" body={actionsTemplate} style={{ width: '8rem' }} />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        header={editing ? 'Editar sede' : 'Nueva sede'}
        onHide={() => setDialogVisible(false)}
        className="w-full max-w-lg"
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Nombre</label>
            <InputText className="w-full" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Ciudad</label>
            <InputText className="w-full" {...register('city', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dna-muted">Dirección</label>
            <InputText className="w-full" {...register('address', { required: true })} />
          </div>
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
