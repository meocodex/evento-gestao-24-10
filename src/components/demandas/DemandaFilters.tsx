import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { StatusDemanda, PrioridadeDemanda, CategoriaDemanda, TipoReembolso } from '@/types/demandas';
import { Search, X, DollarSign, Archive, AlertTriangle, Clock } from 'lucide-react';
import { mockUsuarios } from '@/lib/mock-data/demandas';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useEventos } from '@/contexts/EventosContext';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function DemandaFilters() {
  const { filtros, setFiltros } = useDemandasContext();
  const { eventos } = useEventos();
  const [apenasReembolsos, setApenasReembolsos] = useState(false);

  const toggleStatus = (status: StatusDemanda) => {
    const current = filtros.status || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    setFiltros({ ...filtros, status: updated.length > 0 ? updated : undefined });
  };

  const togglePrioridade = (prioridade: PrioridadeDemanda) => {
    const current = filtros.prioridade || [];
    const updated = current.includes(prioridade)
      ? current.filter(p => p !== prioridade)
      : [...current, prioridade];
    setFiltros({ ...filtros, prioridade: updated.length > 0 ? updated : undefined });
  };

  const toggleCategoria = (categoria: CategoriaDemanda) => {
    const current = filtros.categoria || [];
    const updated = current.includes(categoria)
      ? current.filter(c => c !== categoria)
      : [...current, categoria];
    setFiltros({ ...filtros, categoria: updated.length > 0 ? updated : undefined });
  };

  const toggleStatusPagamento = (status: string) => {
    const current = filtros.statusPagamento || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    setFiltros({ ...filtros, statusPagamento: updated.length > 0 ? updated : undefined });
  };

  const toggleTipoReembolso = (tipo: TipoReembolso) => {
    const current = filtros.tiposReembolso || [];
    const updated = current.includes(tipo)
      ? current.filter(t => t !== tipo)
      : [...current, tipo];
    setFiltros({ ...filtros, tiposReembolso: updated.length > 0 ? updated : undefined });
  };

  const limparFiltros = () => {
    setFiltros({ mostrarArquivadas: false });
    setApenasReembolsos(false);
  };

  const temFiltrosAtivos = Object.keys(filtros).some(key => {
    const value = filtros[key as keyof typeof filtros];
    return value !== undefined && (typeof value !== 'string' || value !== '');
  }) || apenasReembolsos;

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {temFiltrosAtivos && (
          <Button variant="ghost" size="sm" onClick={limparFiltros}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="busca">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="busca"
            placeholder="Título, descrição ou ID..."
            value={filtros.busca || ''}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filtros.status?.includes('aberta') ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus('aberta')}
          >
            Aberta
          </Badge>
          <Badge
            variant={filtros.status?.includes('em-andamento') ? 'secondary' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus('em-andamento')}
          >
            Em Andamento
          </Badge>
          <Badge
            variant={filtros.status?.includes('concluida') ? 'outline' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus('concluida')}
          >
            Concluída
          </Badge>
          <Badge
            variant={filtros.status?.includes('cancelada') ? 'destructive' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus('cancelada')}
          >
            Cancelada
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prioridade</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={filtros.prioridade?.includes('baixa') ? 'bg-blue-500/10 text-blue-500' : 'cursor-pointer'}
            onClick={() => togglePrioridade('baixa')}
          >
            Baixa
          </Badge>
          <Badge
            variant="outline"
            className={filtros.prioridade?.includes('media') ? 'bg-yellow-500/10 text-yellow-500' : 'cursor-pointer'}
            onClick={() => togglePrioridade('media')}
          >
            Média
          </Badge>
          <Badge
            variant="outline"
            className={filtros.prioridade?.includes('alta') ? 'bg-orange-500/10 text-orange-500' : 'cursor-pointer'}
            onClick={() => togglePrioridade('alta')}
          >
            Alta
          </Badge>
          <Badge
            variant="outline"
            className={filtros.prioridade?.includes('urgente') ? 'bg-red-500/10 text-red-500' : 'cursor-pointer'}
            onClick={() => togglePrioridade('urgente')}
          >
            Urgente
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <div className="flex flex-wrap gap-2">
          {['tecnica', 'operacional', 'comercial', 'financeira', 'administrativa', 'reembolso', 'outra'].map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className={filtros.categoria?.includes(cat as CategoriaDemanda) ? 'bg-primary/10 text-primary' : 'cursor-pointer'}
              onClick={() => toggleCategoria(cat as CategoriaDemanda)}
            >
              {cat === 'reembolso' ? (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Reembolso
                </span>
              ) : (
                cat.charAt(0).toUpperCase() + cat.slice(1)
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtros Específicos de Reembolso */}
      <div className="space-y-4 p-3 bg-green-500/5 border border-green-500/20 rounded-md">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apenas-reembolsos"
            checked={apenasReembolsos}
            onCheckedChange={(checked) => {
              setApenasReembolsos(checked as boolean);
              if (checked) {
                toggleCategoria('reembolso');
              }
            }}
          />
          <Label htmlFor="apenas-reembolsos" className="text-sm font-semibold cursor-pointer">
            Apenas Reembolsos
          </Label>
        </div>

        {apenasReembolsos && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Status de Pagamento</Label>
              <div className="flex flex-wrap gap-2">
                {['pendente', 'aprovado', 'pago', 'recusado'].map((status) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={(filtros.statusPagamento || []).includes(status) ? 'bg-green-500/10 text-green-600' : 'cursor-pointer'}
                    onClick={() => toggleStatusPagamento(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tipo de Reembolso</Label>
              <div className="flex flex-wrap gap-2">
                {['frete', 'diaria', 'hospedagem', 'combustivel', 'locacao', 'alimentacao', 'outros'].map((tipo) => (
                  <Badge
                    key={tipo}
                    variant="outline"
                    className={(filtros.tiposReembolso || []).includes(tipo as TipoReembolso) ? 'bg-green-500/10 text-green-600' : 'cursor-pointer'}
                    onClick={() => toggleTipoReembolso(tipo as TipoReembolso)}
                  >
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Evento</Label>
              <Select
                value={filtros.eventoRelacionado || 'todos'}
                onValueChange={(value) => setFiltros({ ...filtros, eventoRelacionado: value === 'todos' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Eventos</SelectItem>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Filtros de Prazo */}
      <div className="space-y-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-md">
        <Label className="font-semibold">Filtros de Prazo</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prazo-vencido"
              checked={filtros.prazoVencido || false}
              onCheckedChange={(checked) => setFiltros({ ...filtros, prazoVencido: checked as boolean })}
            />
            <Label htmlFor="prazo-vencido" className="text-sm cursor-pointer flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              Prazos Vencidos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prazo-proximo"
              checked={filtros.prazoProximo || false}
              onCheckedChange={(checked) => setFiltros({ ...filtros, prazoProximo: checked as boolean })}
            />
            <Label htmlFor="prazo-proximo" className="text-sm cursor-pointer flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-500" />
              Vence em até 3 dias
            </Label>
          </div>
        </div>
      </div>

      {/* Arquivadas */}
      <div className="flex items-center justify-between p-3 bg-gray-500/5 border border-gray-500/20 rounded-md">
        <div className="flex items-center space-x-2">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="mostrar-arquivadas" className="text-sm font-medium cursor-pointer">
            Mostrar Arquivadas
          </Label>
        </div>
        <Switch
          id="mostrar-arquivadas"
          checked={filtros.mostrarArquivadas || false}
          onCheckedChange={(checked) => setFiltros({ ...filtros, mostrarArquivadas: checked })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Select
            value={filtros.responsavel || 'todos'}
            onValueChange={(value) => setFiltros({ ...filtros, responsavel: value === 'todos' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {mockUsuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Solicitante</Label>
          <Select
            value={filtros.solicitante || 'todos'}
            onValueChange={(value) => setFiltros({ ...filtros, solicitante: value === 'todos' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {mockUsuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
