import { useCategorias } from '@/hooks/categorias';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoriaSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoriaSelect({ value, onChange }: CategoriaSelectProps) {
  const { categoriasDespesas } = useCategorias();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma categoria" />
      </SelectTrigger>
      <SelectContent>
        {categoriasDespesas.map((categoria) => (
          <SelectItem key={categoria.value} value={categoria.value}>
            {categoria.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
