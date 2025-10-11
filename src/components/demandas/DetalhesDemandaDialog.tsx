import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { Demanda, StatusDemanda, TipoReembolso } from '@/types/demandas';
import { mockUsuarios } from '@/lib/mock-data/demandas';
import { format } from 'date-fns';
import { MessageSquare, Paperclip, Send, CheckCircle2, AlertCircle, Link2, Repeat, DollarSign, FileText, Download, XCircle, Archive, Play, Ban } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEventosDespesas } from '@/hooks/useEventosDespesas';
import { AprovarReembolsoDialog } from './AprovarReembolsoDialog';
import { MarcarPagoDialog } from './MarcarPagoDialog';
import { RecusarReembolsoDialog } from './RecusarReembolsoDialog';
import { PrazoIndicador } from './PrazoIndicador';

interface DetalhesDemandaDialogProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<StatusDemanda, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  aberta: { label: 'Aberta', variant: 'outline' },
  'em-andamento': { label: 'Em Andamento', variant: 'default' },
  concluida: { label: 'Concluída', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

const tipoReembolsoLabels: Record<TipoReembolso, string> = {
  frete: 'Frete',
  diaria: 'Diária',
  hospedagem: 'Hospedagem',
  combustivel: 'Combustível',
  locacao: 'Locação',
  alimentacao: 'Alimentação',
  outros: 'Outros'
};

const statusPagamentoConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', color: 'bg-blue-100 text-blue-800' },
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800' }
};

export function DetalhesDemandaDialog({ demanda, open, onOpenChange }: DetalhesDemandaDialogProps) {
  const { 
    alterarStatus, 
    atribuirResponsavel, 
    adicionarComentario, 
    removerAnexo, 
    marcarComoResolvida, 
    reabrirDemanda,
    aprovarReembolso,
    marcarReembolsoPago,
    recusarReembolso,
    arquivarDemanda,
    desarquivarDemanda
  } = useDemandasContext();
  const { user } = useAuth();
  const { vincularReembolsoADespesa } = useEventosDespesas();
  const [novoComentario, setNovoComentario] = useState('');
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [showRecusarDialog, setShowRecusarDialog] = useState(false);

  if (!demanda) return null;

  const isAdmin = user?.role === 'admin';

  const handleAlterarStatus = (novoStatus: StatusDemanda) => {
    alterarStatus(demanda.id, novoStatus);
  };

  const handleAtribuirResponsavel = (responsavelId: string) => {
    const responsavel = mockUsuarios.find((u) => u.id === responsavelId);
    if (responsavel) {
      atribuirResponsavel(demanda.id, responsavelId, responsavel.nome);
    }
  };

  const handleEnviarComentario = () => {
    if (!novoComentario.trim()) return;

    const usuarioAtual = mockUsuarios[0];
    adicionarComentario(
      demanda.id,
      novoComentario,
      usuarioAtual.nome,
      usuarioAtual.id
    );
    setNovoComentario('');
  };

  const handleMarcarResolvida = () => {
    marcarComoResolvida(demanda.id);
  };

  const handleReabrirDemanda = () => {
    reabrirDemanda(demanda.id);
  };

  const handleAprovarReembolso = (formaPagamento: string, observacoes?: string) => {
    aprovarReembolso(demanda.id, formaPagamento, observacoes);
    setShowAprovarDialog(false);
  };

  const handleMarcarPago = (dataPagamento: string, comprovante?: string, observacoes?: string) => {
    marcarReembolsoPago(demanda.id, dataPagamento, comprovante, observacoes);
    
    // Vincular reembolso ao financeiro do evento
    if (demanda.eventoRelacionado && demanda.dadosReembolso) {
      vincularReembolsoADespesa(
        demanda.eventoRelacionado,
        demanda.id,
        demanda.titulo,
        demanda.dadosReembolso.valorTotal,
        demanda.dadosReembolso.membroEquipeNome
      );
    }
    
    setShowPagoDialog(false);
  };

  const handleRecusar = (motivo: string) => {
    recusarReembolso(demanda.id, motivo);
    setShowRecusarDialog(false);
  };

  const handleIniciarAtendimento = () => {
    alterarStatus(demanda.id, 'em-andamento');
  };

  const handleConcluirDemanda = () => {
    marcarComoResolvida(demanda.id);
    alterarStatus(demanda.id, 'concluida');
  };

  const handleCancelarDemanda = () => {
    alterarStatus(demanda.id, 'cancelada');
  };

  const handleArquivar = () => {
    arquivarDemanda(demanda.id);
  };

  const handleDesarquivar = () => {
    desarquivarDemanda(demanda.id);
  };

  const isReembolso = demanda.categoria === 'reembolso' && demanda.dadosReembolso;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{demanda.titulo}</DialogTitle>
              <p className="text-muted-foreground mt-1">#{demanda.id}</p>
            </div>
            <div className="flex gap-2">
              {isReembolso && (
                <Badge className="bg-purple-100 text-purple-800">
                  <DollarSign className="mr-1 h-3 w-3" />
                  Reembolso
                </Badge>
              )}
              <Badge variant={statusConfig[demanda.status].variant}>
                {statusConfig[demanda.status].label}
              </Badge>
              {isReembolso && demanda.dadosReembolso && (
                <Badge className={statusPagamentoConfig[demanda.dadosReembolso.statusPagamento].color}>
                  {statusPagamentoConfig[demanda.dadosReembolso.statusPagamento].label}
                </Badge>
              )}
              {demanda.arquivada && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  <Archive className="mr-1 h-3 w-3" />
                  Arquivada
                </Badge>
              )}
              {demanda.resolvida && !demanda.arquivada && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Resolvida
                </Badge>
              )}
              {demanda.prazo && !demanda.arquivada && (
                <PrazoIndicador prazo={demanda.prazo} />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção especial para reembolso */}
          {isReembolso && demanda.dadosReembolso && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Detalhes do Reembolso
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    R$ {demanda.dadosReembolso.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Solicitante</p>
                    <p className="font-medium">{demanda.dadosReembolso.membroEquipeNome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status do Pagamento</p>
                    <Badge className={statusPagamentoConfig[demanda.dadosReembolso.statusPagamento].color}>
                      {statusPagamentoConfig[demanda.dadosReembolso.statusPagamento].label}
                    </Badge>
                  </div>
                  {demanda.dadosReembolso.formaPagamento && (
                    <div>
                      <p className="text-muted-foreground">Forma de Pagamento</p>
                      <p className="font-medium uppercase">{demanda.dadosReembolso.formaPagamento}</p>
                    </div>
                  )}
                  {demanda.dadosReembolso.dataPagamento && (
                    <div>
                      <p className="text-muted-foreground">Data do Pagamento</p>
                      <p className="font-medium">
                        {format(new Date(demanda.dadosReembolso.dataPagamento), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Itens do reembolso */}
                <div>
                  <h4 className="font-semibold mb-3">Itens do Reembolso ({demanda.dadosReembolso.itens.length})</h4>
                  <div className="space-y-2">
                    {demanda.dadosReembolso.itens.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{tipoReembolsoLabels[item.tipo]}</span>
                            </div>
                            <span className="font-bold text-purple-600">
                              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{item.descricao}</p>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground mb-2">Obs: {item.observacoes}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            {item.anexos.length} comprovante(s)
                            {item.anexos.map((anexo) => (
                              <Button
                                key={anexo.id}
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {anexo.nome}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Ações administrativas */}
                {isAdmin && demanda.dadosReembolso.statusPagamento !== 'pago' && demanda.dadosReembolso.statusPagamento !== 'recusado' && (
                  <div className="flex gap-2 pt-4 border-t">
                    {demanda.dadosReembolso.statusPagamento === 'pendente' && (
                      <>
                        <Button 
                          onClick={() => setShowAprovarDialog(true)}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aprovar Reembolso
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => setShowRecusarDialog(true)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar
                        </Button>
                      </>
                    )}
                    {demanda.dadosReembolso.statusPagamento === 'aprovado' && (
                      <Button 
                        onClick={() => setShowPagoDialog(true)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Pago
                      </Button>
                    )}
                  </div>
                )}

                {demanda.dadosReembolso.observacoesPagamento && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{demanda.dadosReembolso.observacoesPagamento}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        <div className="space-y-6">
          {/* Informações principais */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground">{demanda.descricao}</p>
            </div>

            {demanda.eventoRelacionado && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Link2 className="h-4 w-4" />
                <span className="text-sm">
                  <span className="font-medium">Evento vinculado:</span> {demanda.eventoNome}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="outline" className="mt-1">{demanda.categoria}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prioridade</p>
                <Badge variant="outline" className="mt-1">{demanda.prioridade}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solicitante</p>
                <p className="font-medium">{demanda.solicitante}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">{format(new Date(demanda.dataCriacao), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação Rápida */}
          {!demanda.arquivada && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-2">
                {demanda.status === 'aberta' && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={handleIniciarAtendimento}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Atendimento
                  </Button>
                )}
                {demanda.status === 'em-andamento' && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={handleConcluirDemanda}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Concluir Demanda
                  </Button>
                )}
                {demanda.status !== 'cancelada' && demanda.status !== 'concluida' && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleCancelarDemanda}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
                {(demanda.status === 'concluida' || demanda.status === 'cancelada') && isAdmin && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleArquivar}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Controles administrativos */}
          {isAdmin && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm">Controles de Administração</h3>
              <div className="flex flex-wrap gap-2">
                {!demanda.resolvida && demanda.podeResponder && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleMarcarResolvida}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Resolvida
                  </Button>
                )}
                {demanda.resolvida && !demanda.arquivada && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleReabrirDemanda}
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    Reabrir Demanda
                  </Button>
                )}
                {demanda.arquivada && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDesarquivar}
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    Desarquivar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Atribuição de responsável e status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={demanda.status} 
                onValueChange={handleAlterarStatus}
                disabled={demanda.arquivada}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em-andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <Select
                value={demanda.responsavelId || 'sem-responsavel'}
                onValueChange={handleAtribuirResponsavel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs de comentários e anexos */}
          <Tabs defaultValue="comentarios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comentarios">
                <MessageSquare className="mr-2 h-4 w-4" />
                Respostas ({demanda.comentarios.length})
              </TabsTrigger>
              <TabsTrigger value="anexos">
                <Paperclip className="mr-2 h-4 w-4" />
                Anexos ({demanda.anexos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comentarios" className="space-y-4 mt-4">
              {/* Thread de comentários */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {demanda.comentarios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma resposta ainda
                  </p>
                ) : (
                  demanda.comentarios.map((comentario) => (
                    <div
                      key={comentario.id}
                      className={`p-4 rounded-lg ${
                        comentario.tipo === 'sistema'
                          ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                          : comentario.tipo === 'resposta'
                          ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{comentario.autor}</span>
                          {comentario.tipo === 'sistema' && (
                            <Badge variant="outline" className="text-xs">Sistema</Badge>
                          )}
                          {comentario.tipo === 'resposta' && (
                            <Badge variant="outline" className="text-xs">Resposta</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comentario.dataHora), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{comentario.conteudo}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Campo de nova resposta */}
              {demanda.podeResponder ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleEnviarComentario} disabled={!novoComentario.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Resposta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Esta demanda está finalizada e não aceita mais respostas.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="anexos" className="space-y-4 mt-4">
              {demanda.anexos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum anexo
                </p>
              ) : (
                <div className="space-y-2">
                  {demanda.anexos.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{anexo.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {anexo.uploadPor} - {format(new Date(anexo.uploadEm), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerAnexo(demanda.id, anexo.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </DialogContent>

      {/* Dialogs de reembolso */}
      {isReembolso && demanda.dadosReembolso && (
        <>
          <AprovarReembolsoDialog
            open={showAprovarDialog}
            onOpenChange={setShowAprovarDialog}
            onConfirm={handleAprovarReembolso}
            valorTotal={demanda.dadosReembolso.valorTotal}
          />
          <MarcarPagoDialog
            open={showPagoDialog}
            onOpenChange={setShowPagoDialog}
            onConfirm={handleMarcarPago}
            valorTotal={demanda.dadosReembolso.valorTotal}
          />
          <RecusarReembolsoDialog
            open={showRecusarDialog}
            onOpenChange={setShowRecusarDialog}
            onConfirm={handleRecusar}
          />
        </>
      )}
    </Dialog>
  );
}
