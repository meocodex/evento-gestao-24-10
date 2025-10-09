import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Demanda, StatusDemanda } from '@/types/demandas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { mockUsuarios } from '@/lib/mock-data/demandas';
import { Calendar, User, MessageSquare, Paperclip, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DetalhesDemandaDialogProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  aberta: { label: 'Aberta', variant: 'default' as const },
  'em-andamento': { label: 'Em Andamento', variant: 'secondary' as const },
  concluida: { label: 'Concluída', variant: 'outline' as const },
  cancelada: { label: 'Cancelada', variant: 'destructive' as const },
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', className: 'bg-blue-500/10 text-blue-500' },
  media: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-500' },
  alta: { label: 'Alta', className: 'bg-orange-500/10 text-orange-500' },
  urgente: { label: 'Urgente', className: 'bg-red-500/10 text-red-500' },
};

export function DetalhesDemandaDialog({ demanda, open, onOpenChange }: DetalhesDemandaDialogProps) {
  const { alterarStatus, atribuirResponsavel, adicionarComentario, removerAnexo } = useDemandasContext();
  const [novoComentario, setNovoComentario] = useState('');
  const usuarioAtual = mockUsuarios[0];

  if (!demanda) return null;

  const handleAlterarStatus = (novoStatus: StatusDemanda) => {
    alterarStatus(demanda.id, novoStatus);
  };

  const handleAtribuirResponsavel = (responsavelId: string) => {
    const responsavel = mockUsuarios.find(u => u.id === responsavelId);
    if (responsavel) {
      atribuirResponsavel(demanda.id, responsavel.id, responsavel.nome);
    }
  };

  const handleEnviarComentario = () => {
    if (!novoComentario.trim()) return;

    adicionarComentario(demanda.id, {
      autor: usuarioAtual.nome,
      autorId: usuarioAtual.id,
      conteudo: novoComentario,
    });

    setNovoComentario('');
  };

  const statusConf = statusConfig[demanda.status];
  const prioridadeConf = prioridadeConfig[demanda.prioridade];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Demanda #{demanda.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{demanda.titulo}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
              <Badge className={prioridadeConf.className}>{prioridadeConf.label}</Badge>
              <Badge variant="outline">{demanda.categoria}</Badge>
              {demanda.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground">{demanda.descricao}</p>
          </div>

          <Separator />

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={demanda.status} onValueChange={handleAlterarStatus}>
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
              <Label>Responsável</Label>
              <Select
                value={demanda.responsavelId || 'sem-responsavel'}
                onValueChange={handleAtribuirResponsavel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Atribuir responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-responsavel">Sem responsável</SelectItem>
                  {mockUsuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Solicitante: {demanda.solicitante}</span>
            </div>

            {demanda.prazo && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Prazo: {format(new Date(demanda.prazo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Criado em: {format(new Date(demanda.dataCriacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>

            {demanda.dataConclusao && (
              <div className="text-sm text-muted-foreground">
                Concluído em: {format(new Date(demanda.dataConclusao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="comentarios">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comentarios">
                <MessageSquare className="mr-2 h-4 w-4" />
                Comentários ({demanda.comentarios.length})
              </TabsTrigger>
              <TabsTrigger value="anexos">
                <Paperclip className="mr-2 h-4 w-4" />
                Anexos ({demanda.anexos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comentarios" className="space-y-4">
              {/* Lista de comentários */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {demanda.comentarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum comentário ainda
                  </p>
                ) : (
                  demanda.comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{comentario.autor}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comentario.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm">{comentario.conteudo}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Novo comentário */}
              <div className="space-y-2">
                <Label>Adicionar comentário</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite seu comentário..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleEnviarComentario} size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anexos" className="space-y-4">
              <div className="space-y-2">
                {demanda.anexos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum anexo
                  </p>
                ) : (
                  demanda.anexos.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{anexo.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {anexo.uploadPor} • {format(new Date(anexo.uploadEm), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerAnexo(demanda.id, anexo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
