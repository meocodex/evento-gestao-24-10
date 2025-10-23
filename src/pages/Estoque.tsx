import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { EstoqueFilters } from '@/components/estoque/EstoqueFilters';
import { NovoMaterialDialog } from '@/components/estoque/NovoMaterialDialog';
import { EditarMaterialDialog } from '@/components/estoque/EditarMaterialDialog';
import { DetalhesMaterialDialog } from '@/components/estoque/DetalhesMaterialDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EstoqueVirtualList } from '@/components/estoque/EstoqueVirtualList';
import { useEstoqueQueries, useEstoqueMutations, type MaterialEstoque, type FiltrosEstoque } from '@/hooks/estoque';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

export default function Estoque() {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosEstoque>({ busca: '', categoria: 'todas', status: 'todos', localizacao: '' });
  const pageSize = 50;
  const { data, isLoading: loading } = useEstoqueQueries(page, pageSize, filtros);
  const materiais = data?.materiais || [];
  const totalCount = data?.totalCount || 0;
  const mutations = useEstoqueMutations();
  const excluirMaterial = useCallback(async (id: string) => {
    return await mutations.excluirMaterial.mutateAsync(id);
  }, [mutations.excluirMaterial]);
  const materiaisFiltrados = materiais;
  const getEstatisticas = () => ({
    totalItens: materiais.reduce((sum, m) => sum + m.quantidadeTotal, 0),
    totalDisponiveis: materiais.reduce((sum, m) => sum + m.quantidadeDisponivel, 0),
    totalEmUso: materiais.reduce((sum, m) => sum + (m.quantidadeTotal - m.quantidadeDisponivel), 0),
    totalManutencao: 0,
    categorias: new Set(materiais.map(m => m.categoria)).size,
  });
  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialEstoque | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEditarMaterial, setShowEditarMaterial] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materialParaExcluir, setMaterialParaExcluir] = useState<MaterialEstoque | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const stats = getEstatisticas();
  const totalPages = Math.ceil(totalCount / pageSize);

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
      try {
        await excluirMaterial(materialParaExcluir.id);
      } finally {
        setMaterialParaExcluir(null);
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-navy-800">Estoque</h1>
          <p className="text-navy-600 mt-1">
            Gerencie materiais e controle de seriais
          </p>
        </div>
        <Button onClick={() => setShowNovoMaterial(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total de Itens"
          value={stats.totalItens.toString()}
          subtitle={`${materiaisFiltrados.length} tipos`}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Disponíveis"
          value={stats.totalDisponiveis.toString()}
          subtitle="Prontos para uso"
          icon={PackageCheck}
          variant="success"
        />
        <StatCard
          title="Em Uso"
          value={stats.totalEmUso.toString()}
          subtitle="Alocados"
          icon={PackageX}
          variant="warning"
        />
        <StatCard
          title="Manutenção"
          value={stats.totalManutencao.toString()}
          subtitle="Necessitam reparo"
          icon={Wrench}
          variant="danger"
        />
        <StatCard
          title="Categorias"
          value={stats.categorias.toString()}
          subtitle="Tipos diferentes"
          icon={LayoutGrid}
          variant="default"
        />
      </div>

      <EstoqueFilters filtros={filtros} setFiltros={setFiltros} />

      {/* Controles */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Mostrando {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} de {totalCount} materiais
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

      {/* Lista Virtualizada */}
      {viewMode === 'table' ? (
        <Card className="p-0">
          <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/50 text-sm font-medium">
            <div className="w-24 flex-shrink-0">Código</div>
            <div className="flex-1">Material</div>
            <div className="flex-shrink-0">Categoria</div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-16 text-center">Total</div>
              <div className="w-16 text-center">Disponível</div>
              <div className="w-16 text-center">Em Uso</div>
              <div className="w-16 text-center">Manutenção</div>
            </div>
            <div className="w-32 text-right">Ações</div>
          </div>
          <EstoqueVirtualList
            materiais={materiaisFiltrados}
            loading={loading}
            onVerDetalhes={handleVerDetalhes}
            onEditar={handleEditarMaterial}
            onExcluir={handleDeleteClick}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisFiltrados.map((material) => (
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
                    <p className="text-2xl font-bold">{material.quantidade_total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{material.quantidade_disponivel || 0}</p>
                    <p className="text-xs text-muted-foreground">Disp.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">0</p>
                    <p className="text-xs text-muted-foreground">Em Uso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-destructive">0</p>
                    <p className="text-xs text-muted-foreground">Manut.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleVerDetalhes(material)}>
                    <Eye className="h-4 w-4 mr-2" />Detalhes
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditarMaterial(material)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(material)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
              return pageNum <= totalPages ? (
                <PaginationItem key={pageNum}>
                  <PaginationLink onClick={() => setPage(pageNum)} isActive={page === pageNum} className="cursor-pointer">
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ) : null;
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <NovoMaterialDialog open={showNovoMaterial} onOpenChange={setShowNovoMaterial} />
      {materialSelecionado && (
        <>
          <DetalhesMaterialDialog open={showDetalhes} onOpenChange={setShowDetalhes} material={materialSelecionado} />
          <EditarMaterialDialog open={showEditarMaterial} onOpenChange={setShowEditarMaterial} material={materialSelecionado} />
        </>
      )}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Excluir Material"
        description={`Tem certeza que deseja excluir "${materialParaExcluir?.nome}"?`}
      />
    </div>
  );
}
