import { useState } from 'react';
import { useEventosEquipe, useEventosObservacoes } from '@/hooks/eventos';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Plus, Trash2, Send } from 'lucide-react';
import { AdicionarMembroEquipeDialog } from '../modals/AdicionarMembroEquipeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OperacaoEventoProps {
  evento: Evento;
  permissions: any;
}

export function OperacaoEvento({ evento, permissions }: OperacaoEventoProps) {
  const { toast } = useToast();
  const equipeHook = useEventosEquipe(evento.id);
  const observacoesHook = useEventosObservacoes(evento.id);
  const [showAddMembro, setShowAddMembro] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [membroToDelete, setMembroToDelete] = useState<string | null>(null);
  const [novaObservacao, setNovaObservacao] = useState('');

  const handleDeleteMembro = (membroId: string) => {
    setMembroToDelete(membroId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (membroToDelete) {
      try {
        await equipeHook.removerMembroEquipe.mutateAsync(membroToDelete);
      } catch (error) {
        // Erro já tratado pelo hook
      } finally {
        setMembroToDelete(null);
        setShowDeleteDialog(false);
      }
    }
  };

  const handleAdicionarObservacao = async () => {
    if (novaObservacao.trim()) {
      try {
        await observacoesHook.adicionarObservacaoOperacional.mutateAsync(novaObservacao);
        setNovaObservacao('');
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Equipe Alocada</CardTitle>
          {permissions.canEditOperations && (
            <Button size="sm" onClick={() => setShowAddMembro(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {evento.equipe.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum membro alocado
            </p>
          ) : (
            <div className="space-y-3">
              {evento.equipe.map((membro) => (
                <div key={membro.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{membro.nome}</p>
                        {membro.operacionalId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => window.open(`/equipe?id=${membro.operacionalId}`, '_blank')}
                          >
                            Ver perfil
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                    </div>
                    {permissions.canEditOperations && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteMembro(membro.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>{' '}
                      <span className="font-medium">{membro.telefone}</span>
                    </div>
                      {membro.whatsapp && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">WhatsApp:</span>{' '}
                          <span className="font-medium">{membro.whatsapp}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(membro.whatsapp!);
                                toast({ title: 'WhatsApp copiado!' });
                              } catch (error) {
                                toast({ 
                                  title: 'Erro ao copiar',
                                  description: 'Não foi possível copiar o WhatsApp',
                                  variant: 'destructive'
                                });
                              }
                            }}
                          >
                            📋
                          </Button>
                        </div>
                      )}
                  </div>

                  {(membro.dataInicio || membro.dataFim) && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Período:</span>{' '}
                      <span className="font-medium">
                        {membro.dataInicio && format(new Date(membro.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                        {membro.dataInicio && membro.dataFim && ' até '}
                        {membro.dataFim && format(new Date(membro.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  {membro.observacoes && (
                    <div className="text-sm p-2 bg-muted rounded">
                      <span className="text-muted-foreground">Obs:</span>{' '}
                      {membro.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline Operacional</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoTimeline timeline={evento.timeline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações Operacionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {evento.observacoesOperacionais.length > 0 && (
            <ul className="space-y-2">
              {evento.observacoesOperacionais.map((obs, i) => (
                <li key={i} className="text-sm p-2 bg-muted rounded">{obs}</li>
              ))}
            </ul>
          )}
          {permissions.canEditOperations && (
            <div className="space-y-2">
              <Textarea 
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Digite uma nova observação..."
                rows={3}
              />
              <Button size="sm" onClick={handleAdicionarObservacao} disabled={!novaObservacao.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Adicionar Observação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AdicionarMembroEquipeDialog
        open={showAddMembro}
        onOpenChange={setShowAddMembro}
        onAdicionar={async (data) => {
          try {
            await equipeHook.adicionarMembroEquipe.mutateAsync(data);
            setShowAddMembro(false);
          } catch (error) {
            // Erro já tratado pelo hook
          }
        }}
        eventoId={evento.id}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja remover este membro da equipe?"
      />
    </div>
  );
}
