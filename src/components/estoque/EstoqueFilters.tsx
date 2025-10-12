import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEstoque } from '@/contexts/EstoqueContext';
import { Card, CardContent } from '@/components/ui/card';
import { useCategorias } from '@/contexts/CategoriasContext';

export function EstoqueFilters() {
  const { filtros, setFiltros } = useEstoque();
  const { categoriasEstoque, isLoading } = useCategorias();

  const handleReset = () => {
    setFiltros({
      busca: '',
      categoria: 'todas',
      status: 'todos',
      localizacao: '',
    });
  };

  const filtrosAtivos = [
    filtros.busca && 'Busca',
    filtros.categoria !== 'todas' && 'Categoria',
    filtros.status !== 'todos' && 'Status',
    filtros.localizacao && 'Localização',
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">Filtros</h3>
              {filtrosAtivos > 0 && (
                <Badge variant="secondary">{filtrosAtivos}</Badge>
              )}
            </div>
            {filtrosAtivos > 0 && (
              <Button onClick={handleReset} variant="ghost" size="sm">
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome, serial..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filtros.categoria}
                onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : categoriasEstoque.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhuma categoria configurada</SelectItem>
                  ) : (
                    categoriasEstoque.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value: any) => setFiltros({ ...filtros, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em-uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                placeholder="Ex: Estoque A"
                value={filtros.localizacao}
                onChange={(e) => setFiltros({ ...filtros, localizacao: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
