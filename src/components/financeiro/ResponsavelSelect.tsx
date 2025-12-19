import { useUsuarios } from '@/hooks/useUsuarios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from 'lucide-react';

interface ResponsavelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResponsavelSelect({ value, onChange }: ResponsavelSelectProps) {
  const { usuarios = [], isLoading } = useUsuarios();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um responsável"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
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
