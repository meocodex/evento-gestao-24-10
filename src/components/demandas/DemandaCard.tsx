import { Demanda } from '@/types/demandas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MessageSquare, Paperclip, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, XCircle, CalendarDays, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrazoIndicador } from './PrazoIndicador';

interface DemandaCardProps {
  demanda: Demanda;
  onDetalhes: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}

const statusConfig = {
  aberta: { label: 'Aberta', variant: 'default' as const },
  'em-andamento': { label: 'Em Andamento', variant: 'secondary' as const },
  concluida: { label: 'Concluída', variant: 'outline' as const },
  cancelada: { label: 'Cancelada', variant: 'destructive' as const },
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
  media: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' },
  alta: { label: 'Alta', className: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
  urgente: { label: 'Urgente', className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' },
};

const statusPagamentoConfig = {
  pendente: { label: 'Pendente', icon: Clock, className: 'bg-yellow-500/10 text-yellow-500' },
  aprovado: { label: 'Aprovado', icon: CheckCircle, className: 'bg-blue-500/10 text-blue-500' },
  pago: { label: 'Pago', icon: CheckCircle, className: 'bg-green-500/10 text-green-500' },
  recusado: { label: 'Recusado', icon: XCircle, className: 'bg-red-500/10 text-red-500' },
};

export function DemandaCard({ demanda, onDetalhes, onEditar, onExcluir }: DemandaCardProps) {
  const statusConf = statusConfig[demanda.status];
  const prioridadeConf = prioridadeConfig[demanda.prioridade];
  const isReembolso = demanda.categoria === 'reembolso';
  const statusPagamentoConf = demanda.dadosReembolso 
    ? statusPagamentoConfig[demanda.dadosReembolso.statusPagamento]
    : null;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{demanda.titulo}</h3>
              {isReembolso && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Reembolso
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {demanda.descricao}
            </p>
            {isReembolso && demanda.dadosReembolso && (
              <p className="text-sm font-semibold text-green-600 mt-1">
                Valor: R$ {demanda.dadosReembolso.valorTotal.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={onDetalhes}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEditar}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onExcluir}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
          <Badge className={prioridadeConf.className}>{prioridadeConf.label}</Badge>
          {!isReembolso && <Badge variant="outline">{demanda.categoria}</Badge>}
          {statusPagamentoConf && (
            <Badge className={statusPagamentoConf.className}>
              <statusPagamentoConf.icon className="h-3 w-3 mr-1" />
              {statusPagamentoConf.label}
            </Badge>
          )}
          {demanda.arquivada && (
            <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
              <Archive className="h-3 w-3 mr-1" />
              Arquivada
            </Badge>
          )}
          {demanda.prazo && !demanda.arquivada && (
            <PrazoIndicador prazo={demanda.prazo} compact />
          )}
          {demanda.eventoRelacionado && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <CalendarDays className="h-3 w-3 mr-1" />
              {demanda.eventoNome || 'Evento'}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Solicitante: {demanda.solicitante}</span>
          </div>
          
          {demanda.responsavel && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Responsável: {demanda.responsavel}</span>
            </div>
          )}

          {demanda.prazo && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Prazo: {format(new Date(demanda.prazo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{demanda.comentarios.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="h-4 w-4" />
            <span>{demanda.anexos.length}</span>
          </div>
          <div className="ml-auto text-xs">
            Criado em {format(new Date(demanda.dataCriacao), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>
    </Card>
  );
}
