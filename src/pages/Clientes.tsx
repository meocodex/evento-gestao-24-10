import { useState, useMemo } from 'react';
import { useClientes } from '@/hooks/clientes';
import { NovoClienteDialog } from '@/components/clientes/NovoClienteDialog';
import { EditarClienteDialog } from '@/components/clientes/EditarClienteDialog';
import { DetalhesClienteDialog } from '@/components/clientes/DetalhesClienteDialog';
import { ClienteFiltersPopover, ClienteFiltersType } from '@/components/clientes/ClienteFiltersPopover';
import { ClientesVirtualList } from '@/components/clientes/ClientesVirtualList';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Cliente } from '@/types/eventos';
import { Users, User, Building2, Grid3x3, List, Eye, Pencil, Trash2, Search } from 'lucide-react';

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
      // Filtro de tipo
      if (filtros.tipo !== 'todos') {
        if (filtros.tipo === 'cpf' && cliente.tipo !== 'CPF') return false;
        if (filtros.tipo === 'cnpj' && cliente.tipo !== 'CNPJ') return false;
      }

      // Filtro de estado
      if (filtros.estado !== 'todos' && cliente.endereco.estado !== filtros.estado) {
        return false;
      }

      // Filtro de cidade
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

  // Extrair estados e cidades únicas
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

  const handleExcluir = async () => {
    if (clienteSelecionado) {
      try {
        await excluirCliente.mutateAsync(clienteSelecionado.id);
      } finally {
        setDialogAberto(null);
        setClienteSelecionado(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-800">Clientes</h1>
          <p className="text-sm sm:text-base text-navy-600 mt-1">Gerencie seus clientes e contatos</p>
        </div>
        <NovoClienteDialog />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Total de Clientes"
            value={totalClientes.toString()}
            icon={Users}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Pessoa Física (CPF)"
            value={totalCPF.toString()}
            icon={User}
            variant="default"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Pessoa Jurídica (CNPJ)"
            value={totalCNPJ.toString()}
            icon={Building2}
            variant="default"
          />
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ClienteFiltersPopover
          filtros={filtros}
          onFiltrosChange={setFiltros}
          estados={estadosUnicos}
          cidades={cidadesUnicas}
        />
      </div>

      {/* Controles de Visualização */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Mostrando {clientesFiltrados.length} de {totalCount} clientes
        </p>
        <div className="flex gap-2">
          <Button
            variant={visualizacao === 'tabela' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('tabela')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={visualizacao === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('cards')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
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

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(page - 1, 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs */}
      {clienteSelecionado && (
        <>
          <DetalhesClienteDialog
            cliente={clienteSelecionado}
            open={dialogAberto === 'detalhes'}
            onOpenChange={(open) => {
              if (!open) {
                setDialogAberto(null);
                setClienteSelecionado(null);
              }
            }}
          />
          <EditarClienteDialog
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
