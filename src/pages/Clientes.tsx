import { useState, useMemo, useCallback } from 'react';
import { useClientes } from '@/hooks/clientes';
import { NovoClienteSheet } from '@/components/clientes/NovoClienteSheet';
import { EditarClienteSheet } from '@/components/clientes/EditarClienteSheet';
import { DetalhesClienteSheet } from '@/components/clientes/DetalhesClienteSheet';
import { ClienteFiltersPopover, ClienteFiltersType } from '@/components/clientes/ClienteFiltersPopover';
import { ClientesVirtualList } from '@/components/clientes/ClientesVirtualList';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cliente } from '@/types/eventos';
import { Users, User, Building2, Grid3x3, List, Eye, Pencil, Trash2, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Clientes() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<ClienteFiltersType>({
    tipo: 'todos',
    estado: 'todos',
    cidade: 'todas',
  });

  const pageSize = 20;
  const { clientes = [], totalCount = 0, excluirCliente } = useClientes(page, pageSize, searchTerm);

  // Filtrar clientes localmente
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      if (filtros.tipo !== 'todos') {
        if (filtros.tipo === 'cpf' && cliente.tipo !== 'CPF') return false;
        if (filtros.tipo === 'cnpj' && cliente.tipo !== 'CNPJ') return false;
      }
      if (filtros.estado !== 'todos' && cliente.endereco.estado !== filtros.estado) {
        return false;
      }
      if (filtros.cidade !== 'todas' && cliente.endereco.cidade !== filtros.cidade) {
        return false;
      }
      return true;
    });
  }, [clientes, filtros]);

  const [visualizacao, setVisualizacao] = useState<'tabela' | 'cards'>('tabela');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [dialogAberto, setDialogAberto] = useState<'detalhes' | 'editar' | 'excluir' | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const totalClientes = totalCount;
  const totalCPF = clientes.filter((c) => c.tipo === 'CPF').length;
  const totalCNPJ = clientes.filter((c) => c.tipo === 'CNPJ').length;

  const estadosUnicos = useMemo(() => {
    return Array.from(new Set(clientes.map(c => c.endereco.estado).filter(Boolean))).sort();
  }, [clientes]);

  const cidadesUnicas = useMemo(() => {
    if (filtros.estado === 'todos') return [];
    return Array.from(
      new Set(
        clientes
          .filter(c => c.endereco.estado === filtros.estado)
          .map(c => c.endereco.cidade)
          .filter(Boolean)
      )
    ).sort();
  }, [clientes, filtros.estado]);

  const handleExcluir = useCallback(async () => {
    if (clienteSelecionado) {
      try {
        await excluirCliente.mutateAsync(clienteSelecionado.id);
      } finally {
        setDialogAberto(null);
        setClienteSelecionado(null);
      }
    }
  }, [clienteSelecionado, excluirCliente]);

  return (
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          <StatCard
            title="Total de Clientes"
            value={totalClientes.toString()}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Pessoa Física (CPF)"
            value={totalCPF.toString()}
            icon={User}
            variant="default"
          />
          <StatCard
            title="Pessoa Jurídica (CNPJ)"
            value={totalCNPJ.toString()}
            icon={Building2}
            variant="default"
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
          <ClienteFiltersPopover
            filtros={filtros}
            onFiltrosChange={setFiltros}
            estados={estadosUnicos}
            cidades={cidadesUnicas}
          />

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* View Mode */}
          <div className="flex border border-border/60 rounded-lg overflow-hidden bg-background/40">
            <Button
              variant={visualizacao === 'tabela' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setVisualizacao('tabela')}
              aria-label="Tabela"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={visualizacao === 'cards' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setVisualizacao('cards')}
              aria-label="Cards"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Create */}
          <NovoClienteSheet />

          {/* Counter + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{clientesFiltrados.length}</span>/<span>{totalCount}</span>
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

        {/* Lista de Clientes */}
        {visualizacao === 'tabela' ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Cliente</TableHead>
                    <TableHead className="min-w-[80px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px]">Documento</TableHead>
                    <TableHead className="min-w-[180px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Telefone</TableHead>
                    <TableHead className="min-w-[150px]">Localização</TableHead>
                    <TableHead className="text-right min-w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {cliente.tipo === 'CPF' ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {cliente.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cliente.documento}</TableCell>
                    <TableCell className="text-sm">{cliente.email}</TableCell>
                    <TableCell className="text-sm">{cliente.telefone}</TableCell>
                    <TableCell className="text-sm">
                      {cliente.endereco.cidade}/{cliente.endereco.estado}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            setDialogAberto('detalhes');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            setDialogAberto('editar');
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            setDialogAberto('excluir');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </Card>
        ) : (
          <ClientesVirtualList
            clientes={clientesFiltrados}
            onView={(c) => {
              setClienteSelecionado(c);
              setDialogAberto('detalhes');
            }}
            onEdit={(c) => {
              setClienteSelecionado(c);
              setDialogAberto('editar');
            }}
            onDelete={(c) => {
              setClienteSelecionado(c);
              setDialogAberto('excluir');
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      {clienteSelecionado && (
        <>
          <DetalhesClienteSheet
            cliente={clienteSelecionado}
            open={dialogAberto === 'detalhes'}
            onOpenChange={(open) => {
              if (!open) {
                setDialogAberto(null);
                setClienteSelecionado(null);
              }
            }}
          />
          <EditarClienteSheet
            cliente={clienteSelecionado}
            open={dialogAberto === 'editar'}
            onOpenChange={(open) => {
              if (!open) {
                setDialogAberto(null);
                setClienteSelecionado(null);
              }
            }}
          />
          <ConfirmDialog
            open={dialogAberto === 'excluir'}
            onOpenChange={(open) => {
              if (!open) {
                setDialogAberto(null);
                setClienteSelecionado(null);
              }
            }}
            onConfirm={handleExcluir}
            title="Excluir Cliente"
            description={`Tem certeza que deseja excluir ${clienteSelecionado.nome}? Esta ação não pode ser desfeita.`}
          />
        </>
      )}
    </div>
  );
}
