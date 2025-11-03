import { Demanda, StatusDemanda } from '@/types/demandas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandas } from '@/hooks/demandas';
import { useAuth } from '@/hooks/useAuth';
import { useUsuarios } from '@/hooks/useUsuarios';
import { format } from 'date-fns';
import { Link2, Calendar, User, Edit, Play, CheckCircle2, Ban, Archive, RotateCcw } from 'lucide-react';

interface DemandaDadosProps {
  demanda: Demanda;
  onEditar?: () => void;
}

export function DemandaDados({ demanda, onEditar }: DemandaDadosProps) {
  const { 
    alterarStatus, 
    atribuirResponsavel,
    marcarComoResolvida,
    reabrirDemanda,
    arquivarDemanda,
    desarquivarDemanda
  } = useDemandas();
  const { user } = useAuth();
  const { usuarios } = useUsuarios();
  const isAdmin = user?.role === 'admin';

  const handleAlterarStatus = (novoStatus: StatusDemanda) => {
    alterarStatus.mutateAsync({ id: demanda.id, novoStatus });
  };

  const handleAtribuirResponsavel = (responsavelId: string) => {
    const responsavel = (usuarios || []).find((u) => u.id === responsavelId);
    if (responsavel) {
      atribuirResponsavel.mutateAsync({ 
        demandaId: demanda.id, 
        responsavelId, 
        responsavelNome: responsavel.nome 
      });
    }
  };

  const handleIniciarAtendimento = () => {
    alterarStatus.mutateAsync({ id: demanda.id, novoStatus: 'em-andamento' });
  };

  const handleConcluirDemanda = () => {
    marcarComoResolvida.mutateAsync(demanda.id);
    alterarStatus.mutateAsync({ id: demanda.id, novoStatus: 'concluida' });
  };

  const handleCancelarDemanda = () => {
    alterarStatus.mutateAsync({ id: demanda.id, novoStatus: 'cancelada' });
  };

  const handleArquivar = () => {
    arquivarDemanda.mutateAsync(demanda.id);
  };

  const handleDesarquivar = () => {
    desarquivarDemanda.mutateAsync(demanda.id);
  };

  const handleReabrir = () => {
    reabrirDemanda.mutateAsync(demanda.id);
  };

  return (
    <div className="space-y-6">
      {/* Descrição */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Descrição</h3>
        <p className="text-muted-foreground">{demanda.descricao}</p>
      </div>

      {/* Evento vinculado */}
      {demanda.eventoRelacionado && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Link2 className="h-4 w-4" />
          <span className="text-sm">
            <span className="font-medium">Evento vinculado:</span> {demanda.eventoNome}
          </span>
        </div>
      )}

      {/* Informações principais */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Categoria</p>
              <Badge variant="outline">{demanda.categoria}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prioridade</p>
              <Badge variant="outline">{demanda.prioridade}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Solicitante
              </p>
              <p className="font-medium">{demanda.solicitante}</p>
            </div>
            
            {demanda.responsavel ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Responsável
                </p>
                <p className="font-medium">{demanda.responsavel}</p>
              </div>
            ) : isAdmin ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Atribuir Responsável</p>
                <Select onValueChange={handleAtribuirResponsavel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(usuarios || []).map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Criado em
              </p>
              <p className="font-medium">
                {format(new Date(demanda.dataCriacao), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>

            {demanda.prazo && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Prazo
                </p>
                <p className="font-medium">
                  {format(new Date(demanda.prazo), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>

          {demanda.dataConclusao && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Concluído em
              </p>
              <p className="font-medium">
                {format(new Date(demanda.dataConclusao), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Ações</h3>
        
        {onEditar && (
          <Button variant="outline" className="w-full" onClick={onEditar}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Demanda
          </Button>
        )}

        {!demanda.arquivada && (
          <div className="flex flex-col gap-2">
            {demanda.status === 'aberta' && (
              <Button onClick={handleIniciarAtendimento} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Iniciar Atendimento
              </Button>
            )}
            
            {demanda.status === 'em-andamento' && (
              <Button onClick={handleConcluirDemanda} className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir Demanda
              </Button>
            )}
            
            {demanda.status !== 'cancelada' && demanda.status !== 'concluida' && (
              <Button variant="destructive" onClick={handleCancelarDemanda} className="w-full">
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}

            {demanda.resolvida && (
              <Button variant="outline" onClick={handleReabrir} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reabrir Demanda
              </Button>
            )}
            
            {(demanda.status === 'concluida' || demanda.status === 'cancelada') && isAdmin && (
              <Button variant="outline" onClick={handleArquivar} className="w-full">
                <Archive className="mr-2 h-4 w-4" />
                Arquivar
              </Button>
            )}
          </div>
        )}

        {demanda.arquivada && isAdmin && (
          <Button variant="outline" onClick={handleDesarquivar} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Desarquivar
          </Button>
        )}
      </div>
    </div>
  );
}
