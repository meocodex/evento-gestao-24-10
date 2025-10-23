import { useState, useMemo, useCallback } from 'react';
import { useClientesQueries, useClientesMutations } from '@/hooks/clientes';
import { NovoClienteDialog } from '@/components/clientes/NovoClienteDialog';
import { EditarClienteDialog } from '@/components/clientes/EditarClienteDialog';
import { DetalhesClienteDialog } from '@/components/clientes/DetalhesClienteDialog';
import { ClienteFilters } from '@/components/clientes/ClienteFilters';
import { ClienteCard } from '@/components/clientes/ClienteCard';
import { ClientesVirtualList } from '@/components/clientes/ClientesVirtualList';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Cliente } from '@/types/eventos';
import { Users, User, Building2, Grid3x3, List, Eye, Pencil, Trash2 } from 'lucide-react';

export default function Clientes() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 20;
  const { clientes = [], totalCount = 0 } = useClientesQueries(page, pageSize, searchTerm);
  const mutations = useClientesMutations();
  const excluirCliente = useCallback(async (id: string) => {
    return await mutations.excluirCliente.mutateAsync(id);
  }, [mutations.excluirCliente]);
  const clientesFiltrados = clientes;
  const [visualizacao, setVisualizacao] = useState<'tabela' | 'cards'>('tabela');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [dialogAberto, setDialogAberto] = useState<'detalhes' | 'editar' | 'excluir' | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const totalClientes = totalCount;
  const totalCPF = clientes.filter((c) => c.tipo === 'CPF').length;
  const totalCNPJ = clientes.filter((c) => c.tipo === 'CNPJ').length;

  const handleExcluir = async () => {
    if (clienteSelecionado) {
      try {
        await excluirCliente(clienteSelecionado.id);
      } finally {
        setDialogAberto(null);
        setClienteSelecionado(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Navy */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-800">Clientes</h1>
          <p className="text-sm sm:text-base text-navy-600 mt-1">Gerencie seus clientes e contatos</p>
        </div>
        <NovoClienteDialog />
      </div>

      {/* Estatísticas Navy */}
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

      {/* Filtros */}
      <ClienteFilters />

      {/* Controles de Visualização */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-600">
          Mostrando {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} de {totalCount} clientes
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
