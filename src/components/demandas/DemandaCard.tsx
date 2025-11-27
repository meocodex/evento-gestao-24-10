import React from 'react';
import { Demanda } from '@/types/demandas';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, MessageSquare, Paperclip, DollarSign, CheckCircle, Clock, XCircle, CalendarDays, Archive, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrazoIndicador } from './PrazoIndicador';
import { InfoGrid, InfoGridCompact } from '@/components/shared/InfoGrid';

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
      className="group p-4 smooth-hover rounded-xl bg-card cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-display font-semibold text-lg text-card-foreground truncate">{demanda.titulo}</h3>
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                #{demanda.numeroId}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
              {demanda.descricao}
            </p>
          </div>
          <div className="shrink-0 self-center">
            <svg className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
          <Badge className={prioridadeConf.className}>{prioridadeConf.label}</Badge>
          {!isReembolso && <Badge variant="outline">{demanda.categoria}</Badge>}
          {isReembolso && demanda.dadosReembolso && (
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-400 font-semibold text-xs px-2 py-1"
            >
              <DollarSign className="h-4 w-4 mr-0.5" />
              Reembolso • R$ {demanda.dadosReembolso.valorTotal.toFixed(2)}
            </Badge>
          )}
          {statusPagamentoConf && (
            <Badge className={`${statusPagamentoConf.className} text-xs px-2 py-1`}>
              <statusPagamentoConf.icon className="h-4 w-4 mr-0.5" />
              {statusPagamentoConf.label}
            </Badge>
          )}
          {demanda.arquivada && (
            <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 text-xs px-2 py-1">
              <Archive className="h-4 w-4 mr-0.5" />
              Arquivada
            </Badge>
          )}
          {demanda.prazo && !demanda.arquivada && (
            <PrazoIndicador prazo={demanda.prazo} compact />
          )}
          {demanda.eventoRelacionado && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs px-2 py-1">
              <CalendarDays className="h-4 w-4 mr-0.5" />
              {demanda.eventoNome || 'Evento'}
            </Badge>
          )}
        </div>

        <Separator className="my-2" />

        <InfoGrid
          items={[
            {
              icon: User,
              label: 'Solicitante',
              value: demanda.solicitante,
            },
            ...(demanda.responsavel ? [{
              icon: UserCheck,
              label: 'Responsável',
              value: demanda.responsavel,
            }] : []),
            ...(demanda.prazo ? [{
              icon: Calendar,
              label: 'Prazo',
              value: format(new Date(demanda.prazo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
              fullWidth: true,
            }] : []),
          ]}
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <InfoGridCompact
            items={[
              {
                icon: MessageSquare,
                value: demanda.comentarios?.length || 0,
                valueClassName: 'font-medium text-foreground',
              },
              {
                icon: Paperclip,
                value: demanda.anexos?.length || 0,
                valueClassName: 'font-medium text-foreground',
              },
            ]}
          />
          <div className="text-xs text-muted-foreground font-medium">
            {format(new Date(demanda.dataCriacao), "dd/MM/yyyy • HH:mm", { locale: ptBR })}
          </div>
        </div>
      </div>
    </Card>
  );
});
