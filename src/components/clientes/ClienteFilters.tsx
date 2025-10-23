import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useClientes } from '@/hooks/clientes';

const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function ClienteFilters() {
  const { filtros, aplicarFiltros, limparFiltros, clientes } = useClientes();
  const [isOpen, setIsOpen] = useState(false);

  const cidadesDisponiveis = Array.from(
    new Set(
      clientes
        .filter((c) => !filtros.estado || c.endereco.estado === filtros.estado)
        .map((c) => c.endereco.cidade)
    )
  ).sort();

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.tipo !== 'todos') count++;
    if (filtros.estado) count++;
    if (filtros.cidade) count++;
    if (filtros.status !== 'todos') count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, documento, email ou telefone..."
          className="pl-9"
          value={filtros.busca}
          onChange={(e) => aplicarFiltros({ busca: e.target.value })}
        />
      </div>

      {/* Filtros Avançados */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
              {filtrosAtivos > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filtrosAtivos}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          {filtrosAtivos > 0 && (
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={filtros.tipo}
                onValueChange={(value: 'CPF' | 'CNPJ' | 'todos') => aplicarFiltros({ tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="CPF">CPF (Pessoa Física)</SelectItem>
                  <SelectItem value="CNPJ">CNPJ (Pessoa Jurídica)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filtros.estado || 'all'}
                onValueChange={(value) => {
                  aplicarFiltros({ estado: value === 'all' ? '' : value, cidade: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ESTADOS_BRASILEIROS.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Select
                value={filtros.cidade || 'all'}
                onValueChange={(value) => aplicarFiltros({ cidade: value === 'all' ? '' : value })}
                disabled={!filtros.estado}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filtros.estado ? 'Selecione...' : 'Escolha um estado'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {cidadesDisponiveis.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filtros.status}
                onValueChange={(value: 'ativo' | 'inativo' | 'todos') => aplicarFiltros({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
