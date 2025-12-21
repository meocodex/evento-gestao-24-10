import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/StatCard';
import { EstoqueFiltersPopover, EstoqueFiltersType } from '@/components/estoque/EstoqueFiltersPopover';
import { NovoMaterialSheet } from '@/components/estoque/NovoMaterialSheet';
import { EditarMaterialSheet } from '@/components/estoque/EditarMaterialSheet';
import { DetalhesMaterialSheet } from '@/components/estoque/DetalhesMaterialSheet';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EstoqueVirtualList } from '@/components/estoque/EstoqueVirtualList';
import { useEstoque, type MaterialEstoque } from '@/hooks/estoque';
import {
  Package,
  PackageCheck,
  PackageX,
  Wrench,
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function Estoque() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<EstoqueFiltersType>({
    categoria: 'todas',
    status: 'todos',
    localizacao: 'todas',
  });
  
  const pageSize = 50;
  const { materiais = [], totalCount = 0, isLoading: loading, excluirMaterial, sincronizarQuantidades } = useEstoque(page, pageSize, { busca: searchTerm });
  const { hasPermission } = usePermissions();

  const materiaisFiltrados = useMemo(() => {
    return materiais.filter(material => {
      if (filtros.categoria !== 'todas' && material.categoria !== filtros.categoria) {
        return false;
      }

      if (filtros.status !== 'todos') {
        const hasMatchingStatus = material.seriais?.some(serial => {
          if (filtros.status === 'disponivel') return serial.status === 'disponivel';
          if (filtros.status === 'em-uso') return serial.status === 'em-uso';
          if (filtros.status === 'manutencao') return serial.status === 'manutencao';
          if (filtros.status === 'perdido') return serial.status === 'perdido';
          return false;
        });
        if (!hasMatchingStatus) return false;
      }

      if (filtros.localizacao !== 'todas') {
        const hasMatchingLocation = material.seriais?.some(
          serial => serial.localizacao === filtros.localizacao
        );
        if (!hasMatchingLocation) return false;
      }

      return true;
    });
  }, [materiais, filtros]);

  const getEstatisticas = () => {
    let disponiveis = 0;
    let emUso = 0;
    let manutencao = 0;

    materiaisFiltrados.forEach(material => {
      (material.seriais || []).forEach(serial => {
        if (serial.status === 'disponivel') disponiveis++;
        else if (serial.status === 'em-uso') emUso++;
        else if (serial.status === 'manutencao') manutencao++;
      });
    });

    return {
      totalItens: materiaisFiltrados.reduce((sum, m) => sum + m.quantidadeTotal, 0),
      totalDisponiveis: disponiveis,
      totalEmUso: emUso,
      totalManutencao: manutencao,
      categorias: new Set(materiaisFiltrados.map(m => m.categoria)).size,
    };
  };

  const [showNovoMaterial, setShowNovoMaterial] = useState(false);
  const [materialSelecionado, setMaterialSelecionado] = useState<MaterialEstoque | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEditarMaterial, setShowEditarMaterial] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materialParaExcluir, setMaterialParaExcluir] = useState<MaterialEstoque | null>(null);

  const stats = getEstatisticas();
  const totalPages = Math.ceil(totalCount / pageSize);

  const categoriasUnicas = useMemo(() => {
    const cats: string[] = [];
    materiais.forEach(m => {
      if (m.categoria && !cats.includes(m.categoria)) cats.push(m.categoria);
    });
    return cats.sort();
  }, [materiais]);

  const localizacoesUnicas = useMemo(() => {
    const locs: string[] = [];
    materiais.forEach(material => {
      (material.seriais || []).forEach((serial) => {
        if (serial.localizacao && !locs.includes(serial.localizacao)) {
          locs.push(serial.localizacao);
        }
      });
    });
    return locs.sort();
  }, [materiais]);

  const handleVerDetalhes = useCallback((material: MaterialEstoque) => {
    setMaterialSelecionado(material);
    setShowDetalhes(true);
  }, []);

  const handleEditarMaterial = useCallback((material: MaterialEstoque) => {
    setMaterialSelecionado(material);
    setShowEditarMaterial(true);
  }, []);

  const handleDeleteClick = useCallback((material: MaterialEstoque) => {
    setMaterialParaExcluir(material);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (materialParaExcluir) {
      try {
        await excluirMaterial.mutateAsync(materialParaExcluir.id);
      } finally {
        setMaterialParaExcluir(null);
        setShowDeleteConfirm(false);
      }
    }
  }, [materialParaExcluir, excluirMaterial]);

  return (
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
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
        </div>

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Search */}
          <div className="relative min-w-[100px] max-w-[200px] flex-shrink flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Filters */}
          <EstoqueFiltersPopover
            filtros={filtros}
            onFiltrosChange={setFiltros}
            categorias={categoriasUnicas}
            localizacoes={localizacoesUnicas}
          />

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Sync Button */}
          {hasPermission('admin.full_access') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => sincronizarQuantidades.mutate(undefined)}
              disabled={sincronizarQuantidades.isPending}
              className="gap-1 h-8 text-xs px-2.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${sincronizarQuantidades.isPending ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </Button>
          )}

          {/* Create */}
          <Button onClick={() => setShowNovoMaterial(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Novo Material</span>
          </Button>

          {/* Counter + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{materiaisFiltrados.length}</span>/<span>{totalCount}</span>
            </span>

            {totalPages > 1 && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lista Virtualizada */}
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
      </div>

      <NovoMaterialSheet open={showNovoMaterial} onOpenChange={setShowNovoMaterial} />
      {materialSelecionado && (
        <>
          <DetalhesMaterialSheet open={showDetalhes} onOpenChange={setShowDetalhes} material={materialSelecionado} />
          <EditarMaterialSheet open={showEditarMaterial} onOpenChange={setShowEditarMaterial} material={materialSelecionado} />
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
