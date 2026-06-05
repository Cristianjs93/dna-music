import { useState } from 'react';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { PageHeader } from '@/components/common/PageHeader';
import { HeadquarterFormDialog } from '@/components/headquarters/HeadquarterFormDialog';
import { CrudDataTable } from '@/components/crud/CrudDataTable';
import { createGlobalFilter } from '@/components/crud/tableFilters';
import { TableActionsColumn } from '@/components/crud/TableActionsColumn';
import { DnaButton } from '@/components/ui';
import { useHeadquarters } from '@/hooks/useHeadquarters';
import type { HeadquarterFormValues } from '@/hooks/headquarters/headquarter.types';
import type { Headquarter } from '@/types/headquarter.types';
import { confirmDelete } from '@/utils/confirmDelete';
import { formatDate } from '@/utils/format';

const emptyHeadquarterValues: HeadquarterFormValues = {
  name: '',
  city: '',
  address: '',
  isActive: true,
};

const headquarterFilters = createGlobalFilter(['name', 'city']);

export default function HeadquartersPage() {
  const { headquarters, loading, saving, saveHeadquarter, removeHeadquarter } = useHeadquarters();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<Headquarter | null>(null);
  const [formValues, setFormValues] = useState<HeadquarterFormValues>(emptyHeadquarterValues);

  const openCreate = () => {
    setEditing(null);
    setFormValues(emptyHeadquarterValues);
    setDialogVisible(true);
  };

  const openEdit = (hq: Headquarter) => {
    setEditing(hq);
    setFormValues({
      name: hq.name,
      city: hq.city,
      address: hq.address,
      isActive: hq.isActive,
    });
    setDialogVisible(true);
  };

  const onSubmit = async (values: HeadquarterFormValues) => {
    const success = await saveHeadquarter(editing, values);
    if (success) setDialogVisible(false);
  };

  const handleDelete = (hq: Headquarter) => {
    confirmDelete({
      entityLabel: `la sede ${hq.name}`,
      onAccept: async () => {
        await removeHeadquarter(hq);
      },
    });
  };

  return (
    <div>
      <ConfirmDialog />
      <PageHeader
        title="Sedes"
        subtitle="Administración de sedes y ubicaciones."
        action={
          <DnaButton variant="primary" label="Nueva sede" icon="pi pi-plus" onClick={openCreate} />
        }
      />
      <CrudDataTable
        value={headquarters}
        loading={loading}
        title="Listado de sedes"
        emptyMessage="No hay sedes registradas."
        globalFilterFields={['name', 'city', 'address']}
        initialFilters={headquarterFilters}
      >
        <Column field="name" header="Nombre" sortable filter filterPlaceholder="Buscar" />
        <Column field="city" header="Ciudad" sortable filter filterPlaceholder="Buscar" />
        <Column field="address" header="Dirección" sortable />
        <Column
          header="Estado"
          body={(hq: Headquarter) => (
            <div className="flex justify-center">
              <Tag
                value={hq.isActive ? 'Activa' : 'Inactiva'}
                severity={hq.isActive ? 'success' : 'danger'}
              />
            </div>
          )}
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
          body={(row: Headquarter) => (
            <TableActionsColumn row={row} onEdit={openEdit} onDelete={handleDelete} />
          )}
          bodyClassName="text-center"
          style={{ width: '8rem' }}
        />
      </CrudDataTable>
      <HeadquarterFormDialog
        visible={dialogVisible}
        editing={editing}
        initialValues={formValues}
        saving={saving}
        onHide={() => setDialogVisible(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
