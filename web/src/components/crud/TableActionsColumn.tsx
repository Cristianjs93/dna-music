import { Button } from 'primereact/button';

interface TableActionsColumnProps<T> {
  row: T;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export function TableActionsColumn<T>({
  row,
  onEdit,
  onDelete,
}: TableActionsColumnProps<T>) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => onEdit(row)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => onDelete(row)}
        tooltip="Eliminar"
      />
    </div>
  );
}
