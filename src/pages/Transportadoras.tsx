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
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in bg-navy-50 dark:bg-navy-950">
        {/* Header */}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Button onClick={() => setNovoEnvioOpen(true)} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden xs:inline">Novo Envio</span>
          </Button>
          <Button onClick={() => setNovaTransportadoraOpen(true)} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden xs:inline">Nova Transportadora</span>
          </Button>
        </div>

        {/* Stats Cards Navy */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  className="pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
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
        {novoEnvioOpen && <NovoEnvioSheet open={novoEnvioOpen} onOpenChange={setNovoEnvioOpen} />}

        <ConfirmDialog
          open={confirmExcluirTransportadora}
          onOpenChange={setConfirmExcluirTransportadora}
          onConfirm={() => {
            if (transportadoraExcluir) {
              excluirTransportadora.mutateAsync(transportadoraExcluir.id);
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
