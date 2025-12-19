import { useState } from 'react';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface FiltrosFinanceiro {
  dataInicio: Date | undefined;
  dataFim: Date | undefined;
  status: string;
  categoria: string;
  fornecedor: string;
  cliente: string;
}

interface FiltrosPeriodoProps {
  filtros: FiltrosFinanceiro;
  onFiltrosChange: (filtros: FiltrosFinanceiro) => void;
  categorias?: string[];
  fornecedores?: string[];
  clientes?: string[];
  tipo: 'pagar' | 'receber';
}

const periodosPredefinidos = [
  { label: 'Este Mês', getValue: () => ({ inicio: startOfMonth(new Date()), fim: endOfMonth(new Date()) }) },
  { label: 'Mês Anterior', getValue: () => ({ inicio: startOfMonth(subMonths(new Date(), 1)), fim: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Últimos 3 Meses', getValue: () => ({ inicio: startOfMonth(subMonths(new Date(), 2)), fim: endOfMonth(new Date()) }) },
  { label: 'Este Ano', getValue: () => ({ inicio: startOfYear(new Date()), fim: endOfYear(new Date()) }) },
];

export function FiltrosPeriodo({
  filtros,
  onFiltrosChange,
  categorias = [],
  fornecedores = [],
  clientes = [],
  tipo,
}: FiltrosPeriodoProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handlePeriodoRapido = (periodo: (typeof periodosPredefinidos)[0]) => {
    const { inicio, fim } = periodo.getValue();
    onFiltrosChange({ ...filtros, dataInicio: inicio, dataFim: fim });
  };

  const limparFiltros = () => {
    onFiltrosChange({
      dataInicio: undefined,
      dataFim: undefined,
      status: '',
      categoria: '',
      fornecedor: '',
      cliente: '',
    });
  };

  const filtrosAtivos = [
    filtros.dataInicio && filtros.dataFim && `${format(filtros.dataInicio, 'dd/MM')} - ${format(filtros.dataFim, 'dd/MM')}`,
    filtros.status && `Status: ${filtros.status}`,
    filtros.categoria && `Categoria: ${filtros.categoria}`,
    tipo === 'pagar' ? filtros.fornecedor && `Fornecedor: ${filtros.fornecedor}` : filtros.cliente && `Cliente: ${filtros.cliente}`,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Filtro de Período */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              {filtros.dataInicio && filtros.dataFim ? (
                <span>
                  {format(filtros.dataInicio, 'dd/MM/yy', { locale: ptBR })} - {format(filtros.dataFim, 'dd/MM/yy', { locale: ptBR })}
                </span>
              ) : (
                <span>Selecionar Período</span>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b space-y-2">
              <p className="text-sm font-medium">Períodos Rápidos</p>
              <div className="flex flex-wrap gap-1">
                {periodosPredefinidos.map((periodo) => (
                  <Button
                    key={periodo.label}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      handlePeriodoRapido(periodo);
                      setCalendarOpen(false);
                    }}
                  >
                    {periodo.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex">
              <div className="p-3 border-r">
                <p className="text-xs text-muted-foreground mb-2">Data Início</p>
                <CalendarComponent
                  mode="single"
                  selected={filtros.dataInicio}
                  onSelect={(date) => onFiltrosChange({ ...filtros, dataInicio: date })}
                  className={cn("p-0 pointer-events-auto")}
                  locale={ptBR}
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2">Data Fim</p>
                <CalendarComponent
                  mode="single"
                  selected={filtros.dataFim}
                  onSelect={(date) => {
                    onFiltrosChange({ ...filtros, dataFim: date });
                    setCalendarOpen(false);
                  }}
                  className={cn("p-0 pointer-events-auto")}
                  locale={ptBR}
                  disabled={(date) => filtros.dataInicio ? date < filtros.dataInicio : false}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Status */}
        <Select value={filtros.status} onValueChange={(value) => onFiltrosChange({ ...filtros, status: value })}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            {tipo === 'pagar' ? (
              <SelectItem value="pago">Pago</SelectItem>
            ) : (
              <SelectItem value="recebido">Recebido</SelectItem>
            )}
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Categoria */}
        {categorias.length > 0 && (
          <Select value={filtros.categoria} onValueChange={(value) => onFiltrosChange({ ...filtros, categoria: value })}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filtro de Fornecedor/Cliente */}
        {tipo === 'pagar' && fornecedores.length > 0 && (
          <Select value={filtros.fornecedor} onValueChange={(value) => onFiltrosChange({ ...filtros, fornecedor: value })}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {fornecedores.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {tipo === 'receber' && clientes.length > 0 && (
          <Select value={filtros.cliente} onValueChange={(value) => onFiltrosChange({ ...filtros, cliente: value })}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Limpar Filtros */}
        {filtrosAtivos.length > 0 && (
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      {/* Badges de Filtros Ativos */}
      {filtrosAtivos.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <Filter className="h-3 w-3 text-muted-foreground mt-1" />
          {filtrosAtivos.map((filtro, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {filtro}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
