import { useState, type ReactNode } from 'react';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
import { TableSearchInput } from '@/components/common/TableSearchInput';

interface CrudDataTableProps<T extends object> {
  value: T[];
  loading?: boolean;
  dataKey?: string;
  title: string;
  emptyMessage: string;
  globalFilterFields: string[];
  initialFilters: DataTableFilterMeta;
  children: ReactNode;
}

export function CrudDataTable<T extends object>({
  value,
  loading = false,
  dataKey = 'id',
  title,
  emptyMessage,
  globalFilterFields,
  initialFilters,
  children,
}: CrudDataTableProps<T>) {
  const [filters, setFilters] = useState<DataTableFilterMeta>(initialFilters);
  const [globalFilter, setGlobalFilter] = useState('');

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-lg font-semibold">{title}</span>
      <TableSearchInput value={globalFilter} onChange={setGlobalFilter} />
    </div>
  );

  return (
    <DataTable
      value={value}
      loading={loading}
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25]}
      filters={filters}
      filterDisplay="row"
      globalFilterFields={globalFilterFields}
      globalFilter={globalFilter}
      onFilter={(e) => setFilters(e.filters)}
      stripedRows
      showGridlines
      emptyMessage={emptyMessage}
      dataKey={dataKey}
      header={header}
    >
      {children}
    </DataTable>
  );
}
