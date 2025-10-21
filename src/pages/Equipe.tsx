import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCog, Calendar, Search, Plus } from 'lucide-react';
import { useEquipe } from '@/contexts/EquipeContext';
import { OperacionalVirtualList } from '@/components/equipe/operacional/OperacionalVirtualList';
import { NovoOperacionalDialog } from '@/components/equipe/operacional/NovoOperacionalDialog';
import { DetalhesOperacionalDialog } from '@/components/equipe/operacional/DetalhesOperacionalDialog';
import { EditarOperacionalDialog } from '@/components/equipe/operacional/EditarOperacionalDialog';
import { OperacionalEquipe } from '@/types/equipe';
import { GerenciarUsuarios } from '@/components/configuracoes/GerenciarUsuarios';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Equipe() {
  const { 
    operacionais, 
    loading, 
    page, 
    setPage, 
    pageSize, 
    totalCount,
    setFiltros 
  } = useEquipe();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('ativo');
  
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);
  const [detalhesOperacional, setDetalhesOperacional] = useState<OperacionalEquipe | null>(null);
  const [editarOperacional, setEditarOperacional] = useState<OperacionalEquipe | null>(null);

  // Debounce para aplicar filtros server-side
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros({
        searchTerm: searchTerm || undefined,
        funcao: funcaoFilter !== 'todos' ? funcaoFilter : undefined,
        tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
        status: statusFilter !== 'todos' ? statusFilter : undefined,
      });
      setPage(1); // Reset para primeira página ao filtrar
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, funcaoFilter, tipoFilter, statusFilter, setFiltros, setPage]);

  // Obter funções únicas para o filtro
  const funcoesUnicas = Array.from(new Set(operacionais.map(op => op.funcao_principal))).sort();

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipe</h1>
      </div>
        <Tabs defaultValue="operacional" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operacional" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Operacional
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Usuários do Sistema
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          {/* Aba Operacional */}
          <TabsContent value="operacional" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equipe Operacional</CardTitle>
                  <Button onClick={() => setNovoDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, telefone ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={funcaoFilter} onValueChange={setFuncaoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Funções</SelectItem>
                      {funcoesUnicas.map(funcao => (
                        <SelectItem key={funcao} value={funcao}>
                          {funcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                      <SelectItem value="bloqueado">Bloqueados</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista Virtualizada */}
                <OperacionalVirtualList
                  operacionais={operacionais}
                  loading={loading}
                  onDetalhes={setDetalhesOperacional}
                  onEditar={setEditarOperacional}
                />

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(Math.max(1, page - 1))}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Usuários do Sistema */}
          <TabsContent value="usuarios">
            <GerenciarUsuarios />
          </TabsContent>

          {/* Aba Calendário */}
          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Alocações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <NovoOperacionalDialog
          open={novoDialogOpen}
          onOpenChange={setNovoDialogOpen}
        />

        {detalhesOperacional && (
          <DetalhesOperacionalDialog
            operacional={detalhesOperacional}
            open={!!detalhesOperacional}
            onOpenChange={(open) => !open && setDetalhesOperacional(null)}
            onEditar={() => {
              setEditarOperacional(detalhesOperacional);
              setDetalhesOperacional(null);
            }}
          />
        )}

        {editarOperacional && (
          <EditarOperacionalDialog
            operacional={editarOperacional}
            open={!!editarOperacional}
            onOpenChange={(open) => !open && setEditarOperacional(null)}
          />
        )}
    </div>
  );
}
