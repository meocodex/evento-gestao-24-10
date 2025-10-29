import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/StatCard';
import { EstoqueFiltersPopover, EstoqueFiltersType } from '@/components/estoque/EstoqueFiltersPopover';
import { NovoMaterialDialog } from '@/components/estoque/NovoMaterialDialog';
import { EditarMaterialDialog } from '@/components/estoque/EditarMaterialDialog';
import { DetalhesMaterialDialog } from '@/components/estoque/DetalhesMaterialDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EstoqueVirtualList } from '@/components/estoque/EstoqueVirtualList';
import { useEstoque, type MaterialEstoque } from '@/hooks/estoque';
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
  Search,
  LayoutGrid,
} from 'lucide-react';

export default function Estoque() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<EstoqueFiltersType>({
    categoria: 'todas',
    status: 'todos',
    localizacao: 'todas',
  });
  
  const pageSize = 50;
  const { materiais = [], totalCount = 0, isLoading: loading, excluirMaterial } = useEstoque(page, pageSize, { busca: searchTerm });

  // Filtrar materiais localmente com base nos filtros do popover
  const materiaisFiltrados = useMemo(() => {
    return materiais.filter(material => {
      // Filtro de categoria
      if (filtros.categoria !== 'todas' && material.categoria !== filtros.categoria) {
        return false;
      }

      // Filtro de status (baseado nos seriais)
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

      // Filtro de localização
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

  // Extrair categorias e localizações únicas para os filtros
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
      (material.seriais || []).forEach((serial: any) => {
        if (serial.localizacao && !locs.includes(serial.localizacao)) {
          locs.push(serial.localizacao);
        }
      });
    });
    return locs.sort();
  }, [materiais]);

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
        await excluirMaterial.mutateAsync(materialParaExcluir.id);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Busca e Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <EstoqueFiltersPopover
          filtros={filtros}
          onFiltrosChange={setFiltros}
          categorias={categoriasUnicas}
          localizacoes={localizacoesUnicas}
        />
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Mostrando {materiaisFiltrados.length} de {totalCount} materiais
        </p>
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
