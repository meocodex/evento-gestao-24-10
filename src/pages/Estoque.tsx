import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EstoqueFilters } from '@/components/estoque/EstoqueFilters';
import { NovoMaterialDialog } from '@/components/estoque/NovoMaterialDialog';
import { EditarMaterialDialog } from '@/components/estoque/EditarMaterialDialog';
import { DetalhesMaterialDialog } from '@/components/estoque/DetalhesMaterialDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEstoque } from '@/contexts/EstoqueContext';
import {
  Package,
  PackageCheck,
  PackageX,
  Wrench,
  Plus,
  Eye,
  Trash2,
  Edit,
  LayoutGrid,
  List,
} from 'lucide-react';
import { MaterialEstoque } from '@/lib/mock-data/estoque';

export default function Estoque() {
  const { materiaisFiltrados, getEstatisticas, excluirMaterial } = useEstoque();
  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialEstoque | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEditarMaterial, setShowEditarMaterial] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materialParaExcluir, setMaterialParaExcluir] = useState<MaterialEstoque | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const stats = getEstatisticas();

  const handleVerDetalhes = (material: MaterialEstoque) => {
    setMaterialSelecionado(material);
    setShowDetalhes(true);
  };

  const handleEditarMaterial = (material: MaterialEstoque) => {
    setMaterialSelecionado(material);
    setShowEditarMaterial(true);
  };

  const handleDeleteClick = (material: MaterialEstoque) => {
    setMaterialParaExcluir(material);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (materialParaExcluir) {
      await excluirMaterial(materialParaExcluir.id);
      setMaterialParaExcluir(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie materiais e controle de seriais
          </p>
        </div>
        <Button onClick={() => setShowNovoMaterial(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItens}</div>
            <p className="text-xs text-muted-foreground">
              {materiaisFiltrados.length} tipos de materiais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <PackageCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalDisponiveis}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <PackageX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalEmUso}</div>
            <p className="text-xs text-muted-foreground">
              Alocados em eventos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <Wrench className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.totalManutencao}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam reparo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categorias}</div>
            <p className="text-xs text-muted-foreground">
              Tipos diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <EstoqueFilters />

      {/* Controles de Visualização */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {materiaisFiltrados.length} {materiaisFiltrados.length === 1 ? 'material encontrado' : 'materiais encontrados'}
        </p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabela de Materiais */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Categoria</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-center">Disponível</TableHead>
                      <TableHead className="text-center">Em Uso</TableHead>
                      <TableHead className="text-center">Manutenção</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
            </TableHeader>
            <TableBody>
              {materiaisFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum material encontrado
                  </TableCell>
                </TableRow>
              ) : (
                materiaisFiltrados.map((material) => {
                  const emUso = material.seriais.filter(s => s.status === 'em-uso').length;
                  const manutencao = material.seriais.filter(s => s.status === 'manutencao').length;

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-mono text-sm">{material.id}</TableCell>
                      <TableCell className="font-medium">{material.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {material.quantidadeTotal}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-semibold">
                          {material.quantidadeDisponivel}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-orange-600 font-semibold">
                          {emUso}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-destructive font-semibold">
                          {manutencao}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVerDetalhes(material)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarMaterial(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(material)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisFiltrados.map((material) => {
            const emUso = material.seriais.filter(s => s.status === 'em-uso').length;
            const manutencao = material.seriais.filter(s => s.status === 'manutencao').length;

            return (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{material.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{material.id}</p>
                    </div>
                    <Badge variant="outline">{material.categoria}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{material.quantidadeTotal}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {material.quantidadeDisponivel}
                      </p>
                      <p className="text-xs text-muted-foreground">Disp.</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{emUso}</p>
                      <p className="text-xs text-muted-foreground">Em Uso</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">{manutencao}</p>
                      <p className="text-xs text-muted-foreground">Manut.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleVerDetalhes(material)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditarMaterial(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(material)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <NovoMaterialDialog
        open={showNovoMaterial}
        onOpenChange={setShowNovoMaterial}
      />

      {materialSelecionado && (
        <>
          <DetalhesMaterialDialog
            open={showDetalhes}
            onOpenChange={setShowDetalhes}
            material={materialSelecionado}
          />
          <EditarMaterialDialog
            open={showEditarMaterial}
            onOpenChange={setShowEditarMaterial}
            material={materialSelecionado}
          />
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Excluir Material"
        description={`Tem certeza que deseja excluir "${materialParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
