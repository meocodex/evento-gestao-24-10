import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { StatusEvento } from '@/types/eventos';

interface EventoCountdownProps {
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  status?: StatusEvento;
  arquivado?: boolean;
}

type EventoState = 'aguardando' | 'em_andamento' | 'finalizado_aguardando' | 'arquivado';

export function EventoCountdown({ dataInicio, horaInicio, dataFim, horaFim, status, arquivado }: EventoCountdownProps) {
  const [eventoState, setEventoState] = useState<EventoState>('aguardando');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateState = () => {
      const now = new Date();
      const inicio = new Date(`${dataInicio}T${horaInicio}`);
      const fim = new Date(`${dataFim}T${horaFim}`);

      // Prioridade 1: Evento arquivado
      if (arquivado) {
        setEventoState('arquivado');
        setTimeLeft(null);
        return;
      }

      // Prioridade 2: Baseado nas datas
      if (now < inicio) {
        setEventoState('aguardando');
        const difference = inicio.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else if (now >= inicio && now < fim) {
        setEventoState('em_andamento');
        setTimeLeft(null);
      } else {
        setEventoState('finalizado_aguardando');
        setTimeLeft(null);
      }
    };

    calculateState();
    const timer = setInterval(calculateState, 1000);

    return () => clearInterval(timer);
  }, [dataInicio, horaInicio, dataFim, horaFim, arquivado]);

  // Status cancelado tem prioridade sobre tudo
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>❌ Evento cancelado</span>
      </div>
    );
  }

  // Estado arquivado
  if (eventoState === 'arquivado') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>✅ Evento arquivado</span>
      </div>
    );
  }

  // Aguardando início - mostrar countdown
  if (eventoState === 'aguardando' && timeLeft) {

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <div className="flex gap-1 text-sm font-medium">
          {timeLeft.days > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              {timeLeft.days}d
            </span>
          )}
          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>
    );
  }

  // Evento em andamento
  if (eventoState === 'em_andamento') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>🟢 Evento em andamento</span>
      </div>
    );
  }

  // Evento finalizado, aguardando fechamento
  if (eventoState === 'finalizado_aguardando') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>⏳ Evento finalizado, aguardando fechamento</span>
      </div>
    );
  }

  return null;
}
