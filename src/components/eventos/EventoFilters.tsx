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
import { StatusEvento } from '@/types/eventos';
import { Checkbox } from '@/components/ui/checkbox';

export interface EventoFiltersType {
  status: StatusEvento[];
  cidade: string;
  tags: string[];
}

interface EventoFiltersProps {
  filters: EventoFiltersType;
  onFiltersChange: (filters: EventoFiltersType) => void;
  availableCities: string[];
  availableTags: string[];
}

const statusOptions: { value: StatusEvento; label: string }[] = [
  { value: 'orcamento_enviado', label: 'Orçamento Enviado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'materiais_alocados', label: 'Materiais Alocados' },
  { value: 'em_preparacao', label: 'Em Preparação' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_retorno', label: 'Aguardando Retorno' },
  { value: 'aguardando_fechamento', label: 'Aguardando Fechamento' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'aguardando_alocacao', label: 'Aguardando Alocação' },
];

export function EventoFilters({
  filters,
  onFiltersChange,
  availableCities,
  availableTags,
}: EventoFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount =
    filters.status.length +
    (filters.cidade ? 1 : 0) +
    filters.tags.length;

  const handleStatusToggle = (status: StatusEvento) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      cidade: '',
      tags: [],
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
            <label className="text-sm font-medium">Cidade</label>
            <Select
              value={filters.cidade || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, cidade: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
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
            <label className="text-sm font-medium">Tags</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <label htmlFor={tag} className="text-sm cursor-pointer">
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
