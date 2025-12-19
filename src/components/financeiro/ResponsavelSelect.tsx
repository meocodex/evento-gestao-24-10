import { useUsuarios } from '@/hooks/useUsuarios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from 'lucide-react';

const NONE_VALUE = "_none";

interface ResponsavelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResponsavelSelect({ value, onChange }: ResponsavelSelectProps) {
  const { usuarios = [], isLoading } = useUsuarios();

  // Converte valor vazio para "_none" para o Select
  const selectValue = value === "" || value === undefined ? NONE_VALUE : value;

  // Converte "_none" de volta para string vazia no onChange
  const handleChange = (newValue: string) => {
    onChange(newValue === NONE_VALUE ? "" : newValue);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um responsável"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>
          <span className="text-muted-foreground">Nenhum responsável</span>
        </SelectItem>
        {usuarios.map((usuario) => (
          <SelectItem key={usuario.id} value={usuario.nome}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{usuario.nome}</span>
              <span className="text-xs text-muted-foreground">({usuario.role})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
