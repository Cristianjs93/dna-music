import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { DnaInputText } from '@/components/ui/DnaInputText';

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: TableSearchInputProps) {
  return (
    <IconField iconPosition="left" className="table-search">
      <InputIcon className="pi pi-search" />
      <DnaInputText
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="table-search-input"
      />
    </IconField>
  );
}
