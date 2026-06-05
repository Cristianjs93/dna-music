import { confirmDialog } from 'primereact/confirmdialog';

interface ConfirmDeleteOptions {
  entityLabel: string;
  onAccept: () => void | Promise<void>;
}

export function confirmDelete({ entityLabel, onAccept }: ConfirmDeleteOptions): void {
  confirmDialog({
    message: `¿Eliminar ${entityLabel}? Esta operación es irreversible y no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClassName: 'p-button-danger confirm-delete-accept',
    rejectClassName: 'p-button-secondary confirm-delete-reject',
    accept: onAccept,
  });
}
