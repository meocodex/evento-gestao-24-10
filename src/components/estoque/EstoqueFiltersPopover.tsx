import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface EstoqueFiltersType {
  categoria: string;
  status: 'todos' | 'disponivel' | 'em-uso' | 'manutencao' | 'perdido';
  localizacao: string;
}

interface EstoqueFiltersPopoverProps {
  filtros: EstoqueFiltersType;
  onFiltrosChange: (filtros: EstoqueFiltersType) => void;
  categorias: string[];
  localizacoes: string[];
}

export function EstoqueFiltersPopover({
  filtros,
  onFiltrosChange,
  categorias,
  localizacoes,
}: EstoqueFiltersPopoverProps) {
  const [open, setOpen] = useState(false);

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.categoria !== 'todas') count++;
    if (filtros.status !== 'todos') count++;
    if (filtros.localizacao !== 'todas') count++;
    return count;
  };

  const limparFiltros = () => {
    onFiltrosChange({
      categoria: 'todas',
      status: 'todos',
      localizacao: 'todas',
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
              <Label>Categoria</Label>
              <Select
                value={filtros.categoria}
                onValueChange={(value) =>
                  onFiltrosChange({ ...filtros, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value: any) =>
                  onFiltrosChange({ ...filtros, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em-uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Localização</Label>
              <Select
                value={filtros.localizacao}
                onValueChange={(value) =>
                  onFiltrosChange({ ...filtros, localizacao: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {localizacoes.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
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
