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
  const { clientes } = useClientes();
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'todos' as 'todos' | 'CPF' | 'CNPJ',
    estado: '',
    cidade: '',
    status: 'todos' as 'todos' | 'ativo' | 'inativo',
  });
  const [isOpen, setIsOpen] = useState(false);

  const cidadesDisponiveis = Array.from(
    new Set(
      clientes
        .filter((c) => !filtros.estado || c.endereco.estado === filtros.estado)
        .map((c) => c.endereco.cidade)
    )
  ).sort();

  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: 'todos',
      estado: '',
      cidade: '',
      status: 'todos',
    });
  };

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filtrosAtivos}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {filtrosAtivos > 0 && (
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <CollapsibleContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento, email..."
            value={filtros.busca}
            onChange={(e) => aplicarFiltros({ busca: e.target.value })}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select
              value={filtros.tipo}
              onValueChange={(value) => aplicarFiltros({ tipo: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="CPF">Pessoa Física</SelectItem>
                <SelectItem value="CNPJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => {
                aplicarFiltros({ estado: value, cidade: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cidade</label>
            <Select
              value={filtros.cidade}
              onValueChange={(value) => aplicarFiltros({ cidade: value })}
              disabled={!filtros.estado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {cidadesDisponiveis.map((cidade) => (
                  <SelectItem key={cidade} value={cidade}>
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filtros.status}
              onValueChange={(value) => aplicarFiltros({ status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
