import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface EquipeFiltersType {
  tipoMembro: 'todos' | 'sistema' | 'operacional' | 'ambos';
  funcao: string;
  status: 'todos' | 'ativo' | 'inativo' | 'bloqueado';
}

interface EquipeFiltersPopoverProps {
  filtros: EquipeFiltersType;
  onFiltrosChange: (filtros: EquipeFiltersType) => void;
  funcoes: string[];
}

export function EquipeFiltersPopover({
  filtros,
  onFiltrosChange,
  funcoes,
}: EquipeFiltersPopoverProps) {
  const [open, setOpen] = useState(false);

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipoMembro !== 'todos') count++;
    if (filtros.funcao !== 'todas') count++;
    if (filtros.status !== 'todos') count++;
    return count;
  };

  const limparFiltros = () => {
    onFiltrosChange({
      tipoMembro: 'todos',
      funcao: 'todas',
      status: 'todos',
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
              <Label>Tipo de Membro</Label>
            <Select
                value={filtros.tipoMembro}
                onValueChange={(value: string) =>
                  onFiltrosChange({ ...filtros, tipoMembro: value as EquipeFiltersType['tipoMembro'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Select
                value={filtros.funcao}
                onValueChange={(value) =>
                  onFiltrosChange({ ...filtros, funcao: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {funcoes.map((funcao) => (
                    <SelectItem key={funcao} value={funcao}>
                      {funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
            <Select
                value={filtros.status}
                onValueChange={(value: string) =>
                  onFiltrosChange({ ...filtros, status: value as EquipeFiltersType['status'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
