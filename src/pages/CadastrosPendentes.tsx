import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCadastrosQueries } from '@/contexts/cadastros/useCadastrosQueries';
import { useCadastrosMutations } from '@/contexts/cadastros/useCadastrosMutations';
import { useEventos } from '@/hooks/eventos';
import { CheckCircle, XCircle, Eye, Calendar, MapPin, User } from 'lucide-react';
import { CadastroPublico } from '@/types/eventos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function CadastrosPendentes() {
  const { cadastros } = useCadastrosQueries();
  const { aprovarCadastro, recusarCadastro } = useCadastrosMutations();
  const { criarEvento } = useEventos();
  const { toast } = useToast();
  const [selectedCadastro, setSelectedCadastro] = useState<CadastroPublico | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recusarOpen, setRecusarOpen] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const pendentes = cadastros.filter(c => c.status === 'pendente' || c.status === 'em_analise');

  const handleAprovar = async (cadastro: CadastroPublico) => {
    try {
      const evento = await criarEvento({
        nome: cadastro.nome,
        dataInicio: cadastro.dataInicio,
        dataFim: cadastro.dataFim,
        horaInicio: cadastro.horaInicio,
        horaFim: cadastro.horaFim,
        local: cadastro.local,
        cidade: cadastro.cidade,
        estado: cadastro.estado,
        endereco: cadastro.endereco,
        tipoEvento: cadastro.tipoEvento,
        configuracaoIngresso: cadastro.configuracaoIngresso,
        configuracaoBar: cadastro.configuracaoBar,
        clienteId: '',
        comercialId: '',
        tags: [],
      });
      
      await aprovarCadastro.mutateAsync({ cadastroId: cadastro.id, eventoId: evento.id });
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o cadastro.',
        variant: 'destructive',
      });
    }
  };

  const handleRecusar = async () => {
    if (!selectedCadastro) return;
    
    if (!motivoRecusa.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da recusa.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await recusarCadastro.mutateAsync({ cadastroId: selectedCadastro.id, motivo: motivoRecusa });
      setRecusarOpen(false);
      setDetailsOpen(false);
      setMotivoRecusa('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível recusar o cadastro.',
        variant: 'destructive',
      });
    }
  };

  const statusMap = {
    pendente: { label: 'Pendente', variant: 'secondary' as const },
    em_analise: { label: 'Em Análise', variant: 'default' as const },
    aprovado: { label: 'Aprovado', variant: 'default' as const },
    recusado: { label: 'Recusado', variant: 'destructive' as const },
  };

  const tipoEventoMap = {
    ingresso: 'Evento com Ingresso',
    bar: 'Evento de Bar',
    hibrido: 'Híbrido (Ingresso + Bar)',
  };

  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 dark:text-navy-50">Cadastros Públicos Pendentes</h1>
          <p className="text-navy-600 dark:text-navy-400 mt-1">
            Analise e aprove os cadastros de eventos enviados pelos produtores
          </p>
        </div>

        {pendentes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum cadastro pendente no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendentes.map(cadastro => (
              <Card key={cadastro.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{cadastro.nome}</CardTitle>
                        <Badge variant={statusMap[cadastro.status].variant}>
                          {statusMap[cadastro.status].label}
                        </Badge>
                        <Badge variant="outline">
                          {tipoEventoMap[cadastro.tipoEvento]}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Produtor: {cadastro.produtor.nome}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(cadastro.dataInicio), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {cadastro.cidade} - {cadastro.estado}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCadastro(cadastro);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAprovar(cadastro)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar e Criar Evento
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedCadastro(cadastro);
                        setRecusarOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Recusar
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Protocolo: <span className="font-mono">{cadastro.protocolo}</span> • 
                    Cadastrado em {format(new Date(cadastro.dataCriacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Detalhes */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCadastro?.nome}</DialogTitle>
              <DialogDescription>
                Protocolo: {selectedCadastro?.protocolo}
              </DialogDescription>
            </DialogHeader>
            
            {selectedCadastro && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Dados do Evento</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Tipo de Evento</Label>
                      <p>{tipoEventoMap[selectedCadastro.tipoEvento]}</p>
                    </div>
                    <div>
                      <Label>Local</Label>
                      <p>{selectedCadastro.local}</p>
                    </div>
                    <div>
                      <Label>Data de Início</Label>
                      <p>{format(new Date(selectedCadastro.dataInicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                    <div>
                      <Label>Data de Fim</Label>
                      <p>{format(new Date(selectedCadastro.dataFim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Endereço</Label>
                      <p>{selectedCadastro.endereco}, {selectedCadastro.cidade} - {selectedCadastro.estado}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dados do Produtor</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Nome</Label>
                      <p>{selectedCadastro.produtor.nome}</p>
                    </div>
                    <div>
                      <Label>Documento</Label>
                      <p>{selectedCadastro.produtor.documento}</p>
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <p>{selectedCadastro.produtor.telefone}</p>
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <p>{selectedCadastro.produtor.whatsapp}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>E-mail</Label>
                      <p>{selectedCadastro.produtor.email}</p>
                    </div>
                  </div>
                </div>

                {selectedCadastro.configuracaoBar && (
                  <div>
                    <h3 className="font-semibold mb-2">Configuração de Bar</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Máquinas de Bar</Label>
                        <p>{selectedCadastro.configuracaoBar.quantidadeMaquinas}</p>
                      </div>
                      <div>
                        <Label>Quantidade de Bares</Label>
                        <p>{selectedCadastro.configuracaoBar.quantidadeBares}</p>
                      </div>
                      <div className="col-span-2">
                        <Label>Cardápio</Label>
                        <p>{selectedCadastro.configuracaoBar.temCardapio ? 'Sim' : 'Não'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCadastro.configuracaoIngresso && (
                  <div>
                    <h3 className="font-semibold mb-2">Configuração de Ingresso</h3>
                    <div className="text-sm">
                      <Label>Setores</Label>
                      <p>{selectedCadastro.configuracaoIngresso.setores?.length || 0} setores configurados</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => selectedCadastro && handleAprovar(selectedCadastro)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setDetailsOpen(false);
                  setRecusarOpen(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Recusar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Recusa */}
        <Dialog open={recusarOpen} onOpenChange={setRecusarOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recusar Cadastro</DialogTitle>
              <DialogDescription>
                Por favor, informe o motivo da recusa para o produtor
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="motivo">Motivo da Recusa</Label>
              <Textarea
                id="motivo"
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: Data já reservada, informações incompletas, etc."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRecusarOpen(false);
                setMotivoRecusa('');
              }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRecusar}>
                Confirmar Recusa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
