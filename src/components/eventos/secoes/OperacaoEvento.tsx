import { useState } from 'react';
import { useEventos } from '@/contexts/EventosContext';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Plus, Trash2, Send } from 'lucide-react';
import { AdicionarMembroEquipeDialog } from '../modals/AdicionarMembroEquipeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

interface OperacaoEventoProps {
  evento: Evento;
  permissions: any;
}

export function OperacaoEvento({ evento, permissions }: OperacaoEventoProps) {
  const { toast } = useToast();
  const [showAddMembro, setShowAddMembro] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [membroToDelete, setMembroToDelete] = useState<string | null>(null);
  const [novaObservacao, setNovaObservacao] = useState('');

  const handleDeleteMembro = (membroId: string) => {
    setMembroToDelete(membroId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (membroToDelete) {
      toast({
        title: 'Membro removido!',
        description: 'O membro foi removido da equipe.',
      });
      setMembroToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleAdicionarObservacao = () => {
    if (novaObservacao.trim()) {
      toast({
        title: 'Observação adicionada!',
        description: 'A observação foi registrada.',
      });
      setNovaObservacao('');
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
            <div className="space-y-2">
              {evento.equipe.map((membro) => (
                <div key={membro.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{membro.nome}</p>
                    <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{membro.telefone}</p>
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
        onAdicionar={(data) => {
          console.log('Adicionar membro:', data);
        }}
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
