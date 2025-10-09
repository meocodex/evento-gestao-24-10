import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Calendar, MapPin, User, Building2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoCardProps {
  evento: Evento;
  onViewDetails: (evento: Evento) => void;
}

export function EventoCard({ evento, onViewDetails }: EventoCardProps) {
  const isUrgent = () => {
    const eventDate = new Date(evento.data);
    const today = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group relative overflow-hidden">
      {isUrgent() && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
          Urgente
        </div>
      )}
      
      <CardHeader className="space-y-3" onClick={() => onViewDetails(evento)}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {evento.nome}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={evento.status} />
          {evento.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3" onClick={() => onViewDetails(evento)}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(new Date(evento.data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{evento.local} - {evento.cidade}/{evento.estado}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            {evento.cliente.tipo === 'CPF' ? (
              <User className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Building2 className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="line-clamp-1">{evento.cliente.nome}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>Comercial: {evento.comercial.nome}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
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
