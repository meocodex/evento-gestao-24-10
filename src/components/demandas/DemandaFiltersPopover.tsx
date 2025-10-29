import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusDemanda, PrioridadeDemanda } from '@/types/demandas';
import { useUsuarios } from '@/hooks/useUsuarios';

export interface DemandaFiltersType {
  status: StatusDemanda[];
  prioridade: PrioridadeDemanda[];
  responsavel?: string;
  prazoVencido?: boolean;
  prazoProximo?: boolean;
}

interface DemandaFiltersPopoverProps {
  filters: DemandaFiltersType;
  onFiltersChange: (filters: DemandaFiltersType) => void;
}

const statusOptions: { value: StatusDemanda; label: string }[] = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em-andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
];

const prioridadeOptions: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function DemandaFiltersPopover({
  filters,
  onFiltersChange,
}: DemandaFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const { usuarios } = useUsuarios();

  const activeFiltersCount =
    filters.status.length +
    filters.prioridade.length +
    (filters.responsavel ? 1 : 0) +
    (filters.prazoVencido ? 1 : 0) +
    (filters.prazoProximo ? 1 : 0);

  const handleStatusToggle = (status: StatusDemanda) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePrioridadeToggle = (prioridade: PrioridadeDemanda) => {
    const newPrioridade = filters.prioridade.includes(prioridade)
      ? filters.prioridade.filter((p) => p !== prioridade)
      : [...filters.prioridade, prioridade];
    
    onFiltersChange({ ...filters, prioridade: newPrioridade });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      prioridade: [],
      responsavel: undefined,
      prazoVencido: false,
      prazoProximo: false,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {prioridadeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.prioridade.includes(option.value)}
                    onCheckedChange={() => handlePrioridadeToggle(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Responsável</label>
            <Select
              value={filters.responsavel || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, responsavel: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(usuarios || []).map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prazos</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prazo-vencido"
                  checked={filters.prazoVencido || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, prazoVencido: checked as boolean })
                  }
                />
                <label htmlFor="prazo-vencido" className="text-sm cursor-pointer">
                  Vencidos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prazo-proximo"
                  checked={filters.prazoProximo || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, prazoProximo: checked as boolean })
                  }
                />
                <label htmlFor="prazo-proximo" className="text-sm cursor-pointer">
                  Vence em 3 dias
                </label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
