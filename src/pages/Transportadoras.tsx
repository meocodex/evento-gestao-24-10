import { useState, useEffect, useMemo } from 'react';
import { Plus, Truck, Search, Filter, Package, ChevronLeft, ChevronRight } from 'lucide-react';
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
import type { Envio } from '@/types/transportadoras';
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
  const [activeTab, setActiveTab] = useState('transportadoras');
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
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="h-8 p-0.5 bg-muted/50">
              <TabsTrigger value="transportadoras" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Transportadoras</TabsTrigger>
              <TabsTrigger value="envios" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Envios</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Search */}
          <div className="relative min-w-[100px] max-w-[160px] flex-shrink flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Create Buttons */}
          <Button onClick={() => setNovoEnvioOpen(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Envio</span>
          </Button>
          <Button onClick={() => setNovaTransportadoraOpen(true)} variant="outline" size="sm" className="gap-1 h-8 text-xs px-2.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Transportadora</span>
          </Button>

          {/* Counter - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">
                {activeTab === 'transportadoras' ? transportadoras.length : envios.length}
              </span>
              <span>{activeTab === 'transportadoras' ? 'transportadoras' : 'envios'}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transportadoras' && (
          <TransportadorasVirtualGrid
            transportadoras={transportadoras as unknown as Transportadora[]}
            loading={loading}
            onDetalhes={setDetalhesTransportadora}
            onRotas={setGerenciarRotasTransportadora}
            onEditar={setEditarTransportadora}
            onExcluir={(t) => {
              setTransportadoraExcluir(t);
              setConfirmExcluirTransportadora(true);
            }}
          />
        )}

        {activeTab === 'envios' && (
          <div className="space-y-4">
            <EnviosVirtualList
              envios={enviosAtivos as unknown as Envio[]}
              loading={loading}
              title="Envios Ativos"
              emptyMessage="Nenhum envio ativo no momento"
            />
            <EnviosVirtualList
              envios={enviosFinalizados as unknown as Envio[]}
              loading={loading}
              title="Envios Finalizados"
              emptyMessage="Nenhum envio finalizado"
            />
          </div>
        )}
      </div>

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
  );
}
