import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface ClienteFiltersType {
  tipo: 'todos' | 'cpf' | 'cnpj';
  estado: string;
  cidade: string;
}

interface ClienteFiltersPopoverProps {
  filtros: ClienteFiltersType;
  onFiltrosChange: (filtros: ClienteFiltersType) => void;
  estados: string[];
  cidades: string[];
}

export function ClienteFiltersPopover({
  filtros,
  onFiltrosChange,
  estados,
  cidades,
}: ClienteFiltersPopoverProps) {
  const [open, setOpen] = useState(false);

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo !== 'todos') count++;
    if (filtros.estado !== 'todos') count++;
    if (filtros.cidade !== 'todas') count++;
    return count;
  };

  const limparFiltros = () => {
    onFiltrosChange({
      tipo: 'todos',
      estado: 'todos',
      cidade: 'todas',
    });
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {filtrosAtivos > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full px-2 py-0 text-xs">
              {filtrosAtivos}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Filtros</h4>
            {filtrosAtivos > 0 && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value: any) =>
                  onFiltrosChange({ ...filtros, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(value) =>
                  onFiltrosChange({ ...filtros, estado: value, cidade: 'todas' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select
                value={filtros.cidade}
                onValueChange={(value) =>
                  onFiltrosChange({ ...filtros, cidade: value })
                }
                disabled={filtros.estado === 'todos'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
