import { useState, useEffect, useMemo } from 'react';
import { Plus, Truck, Search, Filter } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/StatCard';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NovaTransportadoraSheet } from '@/components/transportadoras/NovaTransportadoraSheet';
import { EditarTransportadoraSheet } from '@/components/transportadoras/EditarTransportadoraSheet';
import { DetalhesTransportadoraSheet } from '@/components/transportadoras/DetalhesTransportadoraSheet';
import { GerenciarRotasSheet } from '@/components/transportadoras/GerenciarRotasSheet';
import { NovoEnvioSheet } from '@/components/transportadoras/NovoEnvioSheet';
import { Transportadora } from '@/types/transportadoras';
import { TransportadorasVirtualGrid } from '@/components/transportadoras/TransportadorasVirtualGrid';
import { EnviosVirtualList } from '@/components/transportadoras/EnviosVirtualList';

export default function Transportadoras() {
  const {
    transportadoras,
    envios,
    loading,
    setFiltrosTransportadoras,
    excluirTransportadora,
  } = useTransportadoras();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'ativa' | 'inativa'>('todas');
  const [novaTransportadoraOpen, setNovaTransportadoraOpen] = useState(false);
  const [editarTransportadora, setEditarTransportadora] = useState<Transportadora | null>(null);
  const [detalhesTransportadora, setDetalhesTransportadora] = useState<Transportadora | null>(null);
  const [gerenciarRotasTransportadora, setGerenciarRotasTransportadora] = useState<Transportadora | null>(null);
  const [novoEnvioOpen, setNovoEnvioOpen] = useState(false);
  const [confirmExcluirTransportadora, setConfirmExcluirTransportadora] = useState(false);
  const [transportadoraExcluir, setTransportadoraExcluir] = useState<Transportadora | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosTransportadoras({
        searchTerm,
        status: statusFilter,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const enviosAtivos = useMemo(() => envios.filter(e => e.status === 'em_transito' || e.status === 'pendente'), [envios]);
  const enviosFinalizados = useMemo(() => envios.filter(e => e.status === 'entregue' || e.status === 'cancelado'), [envios]);

  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 dark:text-navy-50">Transportadoras</h1>
            <p className="text-navy-600 dark:text-navy-400 mt-1">Gestão de transportadoras e envios</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setNovoEnvioOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Envio
            </Button>
            <Button onClick={() => setNovaTransportadoraOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transportadora
            </Button>
          </div>
        </div>

        {/* Stats Cards Navy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={transportadoras.length}
            icon={Truck}
            variant="default"
          />
          <StatCard
            title="Ativas"
            value={transportadoras.filter(t => t.status === 'ativa').length}
            icon={Truck}
            variant="success"
          />
          <StatCard
            title="Envios Ativos"
            value={enviosAtivos.length}
            icon={Package}
            variant="primary"
          />
          <StatCard
            title="Entregas Pendentes"
            value={envios.filter(e => e.status === 'pendente').length}
            icon={Package}
            variant="warning"
          />
        </div>

        {/* Tabs Navy-themed */}
        <Tabs defaultValue="transportadoras" className="space-y-4">
          <TabsList className="bg-navy-100 dark:bg-navy-900">
            <TabsTrigger value="transportadoras" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              Transportadoras
            </TabsTrigger>
            <TabsTrigger value="envios" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              Envios
            </TabsTrigger>
          </TabsList>

          {/* Transportadoras Tab */}
          <TabsContent value="transportadoras" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <TransportadorasVirtualGrid
              transportadoras={transportadoras}
              loading={loading}
              onDetalhes={setDetalhesTransportadora}
              onRotas={setGerenciarRotasTransportadora}
              onEditar={setEditarTransportadora}
              onExcluir={(t) => {
                setTransportadoraExcluir(t);
                setConfirmExcluirTransportadora(true);
              }}
                <Card key={transportadora.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{transportadora.nome}</CardTitle>
                          <CardDescription>{transportadora.cnpj}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={transportadora.status === 'ativa' ? 'default' : 'secondary'}>
                          {transportadora.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {transportadora.rotasAtendidas.filter(r => r.ativa).length} rotas
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Responsável:</span>{' '}
                        {transportadora.responsavel}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telefone:</span>{' '}
                        {transportadora.telefone}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{' '}
                        {transportadora.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cidade:</span>{' '}
                        {transportadora.endereco.cidade} - {transportadora.endereco.estado}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetalhesTransportadora(transportadora)}
                      >
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGerenciarRotasTransportadora(transportadora)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Rotas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditarTransportadora(transportadora)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTransportadoraExcluir(transportadora);
                          setConfirmExcluirTransportadora(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
            />
          </TabsContent>

          {/* Envios Tab */}
          <TabsContent value="envios" className="space-y-4">
            <EnviosVirtualList
              envios={enviosAtivos}
              loading={loading}
              title="Envios Ativos"
              emptyMessage="Nenhum envio ativo no momento"
            />
            <EnviosVirtualList
              envios={enviosFinalizados}
              loading={loading}
              title="Envios Finalizados"
              emptyMessage="Nenhum envio finalizado"
            />
          </TabsContent>
        </Tabs>

        {/* Sheets */}
        <NovaTransportadoraSheet open={novaTransportadoraOpen} onOpenChange={setNovaTransportadoraOpen} />
        {editarTransportadora && (
          <EditarTransportadoraSheet
            transportadora={editarTransportadora}
            open={!!editarTransportadora}
            onOpenChange={(open) => !open && setEditarTransportadora(null)}
          />
        )}
        {detalhesTransportadora && (
          <DetalhesTransportadoraSheet
            transportadora={detalhesTransportadora}
            open={!!detalhesTransportadora}
            onOpenChange={(open) => !open && setDetalhesTransportadora(null)}
          />
        )}
        {gerenciarRotasTransportadora && (
          <GerenciarRotasSheet
            transportadora={gerenciarRotasTransportadora}
            open={!!gerenciarRotasTransportadora}
            onOpenChange={(open) => !open && setGerenciarRotasTransportadora(null)}
          />
        )}
        <NovoEnvioSheet open={novoEnvioOpen} onOpenChange={setNovoEnvioOpen} />

        <ConfirmDialog
          open={confirmExcluirTransportadora}
          onOpenChange={setConfirmExcluirTransportadora}
          onConfirm={() => {
            if (transportadoraExcluir) {
              excluirTransportadora(transportadoraExcluir.id);
              setConfirmExcluirTransportadora(false);
              setTransportadoraExcluir(null);
            }
          }}
          title="Excluir Transportadora"
          description={`Tem certeza que deseja excluir a transportadora "${transportadoraExcluir?.nome}"? Esta ação não pode ser desfeita.`}
          variant="danger"
          confirmText="Excluir"
        />
      </div>
    </div>
  );
}
