import React from 'react';
import { Demanda } from '@/types/demandas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, Paperclip, DollarSign, CheckCircle, Clock, XCircle, CalendarDays, Archive, UserCheck, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrazoIndicador } from './PrazoIndicador';

const statusConfig = {
  aberta: { label: 'Aberta', variant: 'default' as const },
  'em-andamento': { label: 'Em Andamento', variant: 'secondary' as const },
  concluida: { label: 'Concluída', variant: 'outline' as const },
  cancelada: { label: 'Cancelada', variant: 'destructive' as const },
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', className: 'bg-primary/10 text-primary hover:bg-primary/20' },
  media: { label: 'Média', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
  alta: { label: 'Alta', className: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 dark:text-orange-400' },
  urgente: { label: 'Urgente', className: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
};

const statusPagamentoConfig = {
  pendente: { label: 'Pendente', icon: Clock, className: 'bg-warning/10 text-warning' },
  aprovado: { label: 'Aprovado', icon: CheckCircle, className: 'bg-primary/10 text-primary' },
  pago: { label: 'Pago', icon: CheckCircle, className: 'bg-success/10 text-success' },
  recusado: { label: 'Recusado', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

interface DemandaCardProps {
  demanda: Demanda;
  onClick: () => void;
}

export const DemandaCard = React.memo(function DemandaCard({ demanda, onClick }: DemandaCardProps) {
  const statusConf = statusConfig[demanda.status];
  const prioridadeConf = prioridadeConfig[demanda.prioridade];
  const isReembolso = demanda.categoria === 'reembolso';
  const statusPagamentoConf = demanda.dadosReembolso 
    ? statusPagamentoConfig[demanda.dadosReembolso.statusPagamento]
    : null;

  return (
    <Card 
      className="group p-3 smooth-hover rounded-lg bg-card cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-1.5">
        {/* Header: Title + Number + Arrow */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-display font-semibold text-base text-card-foreground truncate">{demanda.titulo}</h3>
            <Badge variant="outline" className="font-mono text-[10px] shrink-0 px-1.5 py-0">
              #{demanda.numeroId}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-1">
          {demanda.descricao}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant={statusConf.variant} className="text-[10px] px-1.5 py-0">{statusConf.label}</Badge>
          <Badge className={`${prioridadeConf.className} text-[10px] px-1.5 py-0`}>{prioridadeConf.label}</Badge>
          {!isReembolso && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{demanda.categoria}</Badge>}
          {isReembolso && demanda.dadosReembolso && (
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-400 text-[10px] px-1.5 py-0"
            >
              <DollarSign className="h-3 w-3 mr-0.5" />
              R$ {demanda.dadosReembolso.valorTotal.toFixed(2)}
            </Badge>
          )}
          {statusPagamentoConf && (
            <Badge className={`${statusPagamentoConf.className} text-[10px] px-1.5 py-0`}>
              <statusPagamentoConf.icon className="h-3 w-3 mr-0.5" />
              {statusPagamentoConf.label}
            </Badge>
          )}
          {demanda.arquivada && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
              <Archive className="h-3 w-3 mr-0.5" />
              Arquivada
            </Badge>
          )}
          {demanda.prazo && !demanda.arquivada && (
            <PrazoIndicador prazo={demanda.prazo} compact />
          )}
          {demanda.eventoRelacionado && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] px-1.5 py-0">
              <CalendarDays className="h-3 w-3 mr-0.5" />
              {demanda.eventoNome || 'Evento'}
            </Badge>
          )}
        </div>

        {/* Footer: Info + Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {demanda.solicitante}
            </span>
            {demanda.responsavel && (
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                {demanda.responsavel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {demanda.comentarios?.length || 0}
            </span>
            <span className="flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {demanda.anexos?.length || 0}
            </span>
            <span className="text-[10px]">
              {format(new Date(demanda.dataCriacao), "dd/MM", { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
});
