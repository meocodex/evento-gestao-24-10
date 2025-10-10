import { Evento } from '@/types/eventos';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Briefcase, Package, Edit, Copy, ListOrdered } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoCountdown } from './EventoCountdown';
import { useMemo } from 'react';

interface EventoCardProps {
  evento: Evento;
  onViewDetails: (evento: Evento) => void;
}

export function EventoCard({ evento, onViewDetails }: EventoCardProps) {
  const dataEvento = parseISO(evento.dataInicio);
  const diasAteEvento = differenceInDays(dataEvento, new Date());
  const isUrgente = diasAteEvento >= 0 && diasAteEvento < 7;

  // Status color coding
  const statusBorderColor = useMemo(() => {
    const statusColors = {
      finalizado: 'border-t-success',
      confirmado: 'border-t-blue-500',
      em_preparacao: 'border-t-blue-500',
      materiais_alocados: 'border-t-yellow-500',
      em_andamento: 'border-t-orange-500',
      cancelado: 'border-t-destructive',
      orcamento_enviado: 'border-t-muted-foreground',
      aguardando_retorno: 'border-t-yellow-500',
      aguardando_fechamento: 'border-t-purple-500',
      aguardando_alocacao: 'border-t-cyan-500',
    };
    return statusColors[evento.status] || 'border-t-muted';
  }, [evento.status]);

  // Progress indicator
  const progress = useMemo(() => {
    const statusSteps = {
      orcamento_enviado: 1,
      aguardando_retorno: 1,
      confirmado: 2,
      aguardando_alocacao: 2,
      materiais_alocados: 3,
      em_preparacao: 3,
      em_andamento: 4,
      aguardando_fechamento: 4,
      finalizado: 5,
      cancelado: 0,
    };
    const step = statusSteps[evento.status] || 0;
    return (step / 5) * 100;
  }, [evento.status]);

  // Materials count
  const materiaisCount = useMemo(() => {
    return {
      antecipado: evento.materiaisAlocados.antecipado.length,
      comTecnicos: evento.materiaisAlocados.comTecnicos.length,
      total: evento.materiaisAlocados.antecipado.length + evento.materiaisAlocados.comTecnicos.length,
    };
  }, [evento.materiaisAlocados]);

  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in flex flex-col h-full group relative overflow-hidden border-t-4 ${statusBorderColor}`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Quick actions on hover */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(evento)}
          className="shadow-lg"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(evento)}
          className="shadow-lg"
        >
          <ListOrdered className="h-4 w-4 mr-2" />
          Timeline
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement duplicate
          }}
          className="shadow-lg"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-[1] flex flex-col h-full">
        <div className="space-y-3 mb-4">
          <h3 className="text-xl font-display font-bold line-clamp-2">{evento.nome}</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={evento.status} />
            {isUrgente && (
              <Badge variant="destructive" className="animate-pulse-subtle">
                🔥 Urgente
              </Badge>
            )}
            {evento.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>

        <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} />

        <div className="flex-1 space-y-4 mt-4">
          {/* Progress bar */}
          {evento.status !== 'cancelado' && (
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Etapa {Math.ceil(progress / 20)} de 5
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {format(dataEvento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            {evento.horaInicio} - {evento.horaFim}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="line-clamp-1">{evento.local} - {evento.cidade}/{evento.estado}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 text-purple-500" />
            <span className="line-clamp-1">{evento.cliente.nome}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 text-orange-500" />
            <span className="line-clamp-1">{evento.comercial.nome}</span>
          </div>

          {/* Materials preview */}
          {materiaisCount.total > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-success" />
              <div className="flex flex-wrap gap-2">
                {materiaisCount.antecipado > 0 && (
                  <Badge variant="outline" className="text-xs">
                    🚚 Antecipado: {materiaisCount.antecipado}
                  </Badge>
                )}
                {materiaisCount.comTecnicos > 0 && (
                  <Badge variant="outline" className="text-xs">
                    👷 Com Técnicos: {materiaisCount.comTecnicos}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(evento);
          }}
        >
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}
