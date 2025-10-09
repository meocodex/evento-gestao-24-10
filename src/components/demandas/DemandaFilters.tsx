import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { StatusDemanda, PrioridadeDemanda, CategoriaDemanda } from '@/types/demandas';
import { Search, X } from 'lucide-react';
import { mockUsuarios } from '@/lib/mock-data/demandas';
import { Badge } from '@/components/ui/badge';

export function DemandaFilters() {
  const { filtros, setFiltros } = useDemandasContext();

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

  const limparFiltros = () => {
    setFiltros({});
  };

  const temFiltrosAtivos = Object.keys(filtros).some(key => {
    const value = filtros[key as keyof typeof filtros];
    return value !== undefined && (typeof value !== 'string' || value !== '');
  });

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
          {['tecnica', 'operacional', 'comercial', 'financeira', 'administrativa', 'outra'].map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className={filtros.categoria?.includes(cat as CategoriaDemanda) ? 'bg-primary/10 text-primary' : 'cursor-pointer'}
              onClick={() => toggleCategoria(cat as CategoriaDemanda)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          ))}
        </div>
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
