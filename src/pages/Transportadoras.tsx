import { useState, useEffect, useMemo } from 'react';
import { Plus, Truck, Search, Filter, Package } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/StatCard';
import { useTransportadoras } from '@/hooks/transportadoras';
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
      // Filtros aplicados localmente
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
