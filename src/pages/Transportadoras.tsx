import { useState } from 'react';
import { Plus, Truck, Search, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NovaTransportadoraDialog } from '@/components/transportadoras/NovaTransportadoraDialog';
import { EditarTransportadoraDialog } from '@/components/transportadoras/EditarTransportadoraDialog';
import { DetalhesTransportadoraDialog } from '@/components/transportadoras/DetalhesTransportadoraDialog';
import { GerenciarRotasDialog } from '@/components/transportadoras/GerenciarRotasDialog';
import { NovoEnvioDialog } from '@/components/transportadoras/NovoEnvioDialog';
import { EnvioCard } from '@/components/transportadoras/EnvioCard';
import { Transportadora } from '@/types/transportadoras';

export default function Transportadoras() {
  const { transportadoras, envios, excluirTransportadora } = useTransportadoras();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'ativa' | 'inativa'>('todas');
  const [novaTransportadoraOpen, setNovaTransportadoraOpen] = useState(false);
  const [editarTransportadora, setEditarTransportadora] = useState<Transportadora | null>(null);
  const [detalhesTransportadora, setDetalhesTransportadora] = useState<Transportadora | null>(null);
  const [gerenciarRotasTransportadora, setGerenciarRotasTransportadora] = useState<Transportadora | null>(null);
  const [novoEnvioOpen, setNovoEnvioOpen] = useState(false);

  const transportadorasFiltradas = transportadoras.filter((t) => {
    const matchSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cnpj.includes(searchTerm);
    const matchStatus = statusFilter === 'todas' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const enviosAtivos = envios.filter(e => e.status === 'em_transito' || e.status === 'pendente');
  const enviosFinalizados = envios.filter(e => e.status === 'entregue' || e.status === 'cancelado');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transportadoras</h1>
            <p className="text-muted-foreground">Gestão de transportadoras e envios</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transportadoras.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {transportadoras.filter(t => t.status === 'ativa').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Envios Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{enviosAtivos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entregas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {envios.filter(e => e.status === 'pendente').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transportadoras" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transportadoras">Transportadoras</TabsTrigger>
            <TabsTrigger value="envios">Envios</TabsTrigger>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transportadorasFiltradas.map((transportadora) => (
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
                        className="col-span-2"
                        onClick={() => setEditarTransportadora(transportadora)}
                      >
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Envios Tab */}
          <TabsContent value="envios" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Envios Ativos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enviosAtivos.map((envio) => (
                    <EnvioCard key={envio.id} envio={envio} />
                  ))}
                  {enviosAtivos.length === 0 && (
                    <p className="text-muted-foreground col-span-2">Nenhum envio ativo no momento</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Envios Finalizados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enviosFinalizados.map((envio) => (
                    <EnvioCard key={envio.id} envio={envio} />
                  ))}
                  {enviosFinalizados.length === 0 && (
                    <p className="text-muted-foreground col-span-2">Nenhum envio finalizado</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <NovaTransportadoraDialog open={novaTransportadoraOpen} onOpenChange={setNovaTransportadoraOpen} />
        {editarTransportadora && (
          <EditarTransportadoraDialog
            transportadora={editarTransportadora}
            open={!!editarTransportadora}
            onOpenChange={(open) => !open && setEditarTransportadora(null)}
          />
        )}
        {detalhesTransportadora && (
          <DetalhesTransportadoraDialog
            transportadora={detalhesTransportadora}
            open={!!detalhesTransportadora}
            onOpenChange={(open) => !open && setDetalhesTransportadora(null)}
          />
        )}
        {gerenciarRotasTransportadora && (
          <GerenciarRotasDialog
            transportadora={gerenciarRotasTransportadora}
            open={!!gerenciarRotasTransportadora}
            onOpenChange={(open) => !open && setGerenciarRotasTransportadora(null)}
          />
        )}
        <NovoEnvioDialog open={novoEnvioOpen} onOpenChange={setNovoEnvioOpen} />
      </div>
    </div>
  );
}
