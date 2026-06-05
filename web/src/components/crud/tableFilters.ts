import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';

export function createGlobalFilter(fields: string[]): DataTableFilterMeta {
  return {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ...Object.fromEntries(
      fields.map((field) => [
        field,
        { value: null, matchMode: FilterMatchMode.CONTAINS },
      ]),
    ),
  };
}
