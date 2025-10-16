import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, ChevronDown, Tag, Clock, Building } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EventosListAccordionProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
}

export function EventosListAccordion({ eventos, onViewDetails }: EventosListAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    const newSet = new Set(openIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenIds(newSet);
  };

  if (eventos.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Nenhum evento encontrado
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      {eventos.map((evento) => {
        const isOpen = openIds.has(evento.id);
        
        return (
          <Collapsible
            key={evento.id}
            open={isOpen}
            onOpenChange={() => toggleOpen(evento.id)}
          >
            <div className="border rounded-lg bg-card hover:shadow-md transition-all">
              {/* Linha compacta */}
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                      isOpen && "rotate-180"
                    )}
                  />
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center text-left">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{evento.nome}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block truncate">
                        {evento.cliente.nome}
                      </p>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(parseISO(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{evento.cidade || 'N/A'}</span>
                    </div>
                    
                    <div className="hidden sm:block">
                      <StatusBadge status={evento.status} />
                    </div>
                    
                    <div className="hidden sm:flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(evento);
                        }}
                        className="min-h-[44px]"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Detalhes expandidos */}
              <CollapsibleContent>
                <div className="border-t p-4 bg-muted/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                        <p className="font-medium">{evento.cliente.nome}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {format(parseISO(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horário</p>
                        <p className="font-medium">{evento.horaInicio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Local</p>
                        <p className="font-medium">{evento.local || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cidade</p>
                        <p className="font-medium">{evento.cidade || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <StatusBadge status={evento.status} />
                    </div>
                  </div>

                  {evento.tags && evento.tags.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {evento.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 sm:hidden">
                    <Button
                      onClick={() => onViewDetails(evento)}
                      className="w-full min-h-[44px]"
                    >
                      Ver Detalhes Completos
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
