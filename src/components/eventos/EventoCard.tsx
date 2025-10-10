import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoCountdown } from './EventoCountdown';
import { Calendar, MapPin, User, Building2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoCardProps {
  evento: Evento;
  onViewDetails: (evento: Evento) => void;
}

export function EventoCard({ evento, onViewDetails }: EventoCardProps) {
  const isUrgent = () => {
    const eventDate = new Date(`${evento.dataInicio}T${evento.horaInicio}`);
    const today = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden border-2 hover:border-primary/20 animate-fade-in">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Urgente badge with pulse animation */}
      {isUrgent() && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-bl-xl font-semibold shadow-lg flex items-center gap-1.5 animate-pulse-subtle">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-glow" />
            Urgente
          </div>
        </div>
      )}
      
      <CardHeader className="space-y-3 relative z-10" onClick={() => onViewDetails(evento)}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {evento.nome}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={evento.status} />
          {evento.tags.map((tag, index) => (
            <Badge 
              key={tag} 
              variant="outline"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10" onClick={() => onViewDetails(evento)}>
        <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} />
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground group/item">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="flex-1">
              {format(new Date(evento.dataInicio), "dd 'de' MMM", { locale: ptBR })} às {evento.horaInicio}
              {' → '}
              {format(new Date(evento.dataFim), "dd 'de' MMM", { locale: ptBR })} às {evento.horaFim}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group/item">
            <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover/item:bg-accent group-hover/item:text-white transition-colors">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="line-clamp-1 flex-1">{evento.local} - {evento.cidade}/{evento.estado}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group/item">
            <div className="p-2 rounded-lg bg-success/10 text-success group-hover/item:bg-success group-hover/item:text-white transition-colors">
              {evento.cliente.tipo === 'CPF' ? (
                <User className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
            </div>
            <span className="line-clamp-1 flex-1">{evento.cliente.nome}</span>
          </div>
          
          <div className="flex items-center gap-3 text-muted-foreground group/item">
            <div className="p-2 rounded-lg bg-muted text-foreground group-hover/item:bg-foreground group-hover/item:text-background transition-colors">
              <User className="h-4 w-4" />
            </div>
            <span className="flex-1">Comercial: {evento.comercial.nome}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-white group-hover:border-transparent transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(evento);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
