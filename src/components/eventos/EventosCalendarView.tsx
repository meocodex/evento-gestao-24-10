import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Evento } from '@/types/eventos';
import { cn } from '@/lib/utils';

interface EventosCalendarViewProps {
  eventos: Evento[];
  onEventoClick: (evento: Evento) => void;
}

const statusColors: Record<string, string> = {
  orcamento: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  confirmado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  em_preparacao: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  em_execucao: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  concluido: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function EventosCalendarView({ eventos, onEventoClick }: EventosCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventosForDay = (day: Date) => {
    return eventos.filter(evento => {
      const eventoDate = new Date(evento.dataInicio);
      return isSameDay(eventoDate, day);
    });
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <Card className="p-4 bg-card border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-card-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="hidden sm:flex"
            >
              Hoje
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-4 bg-card border">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayEventos = getEventosForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] p-2 rounded-lg border transition-colors",
                  isCurrentMonth
                    ? "bg-card border"
                    : "bg-muted/50 border-border/50",
                  isDayToday && "ring-2 ring-primary"
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                      isDayToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEventos.length > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs px-1.5">
                      {dayEventos.length}
                    </Badge>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEventos.slice(0, 2).map(evento => (
                    <button
                      key={evento.id}
                      onClick={() => onEventoClick(evento)}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs truncate transition-all hover:scale-[1.02] hover:shadow-sm",
                        statusColors[evento.status]
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate font-medium">{evento.nome}</span>
                      </div>
                      {evento.cliente && (
                        <div className="flex items-center gap-1 mt-0.5 opacity-80">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{evento.cliente.nome}</span>
                        </div>
                      )}
                    </button>
                  ))}
                  {dayEventos.length > 2 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayEventos.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 bg-card border">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">
          Legenda de Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", color)} />
              <span className="text-xs text-muted-foreground capitalize">
                {status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
