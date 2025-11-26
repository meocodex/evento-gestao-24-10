import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { StatusEvento } from '@/types/eventos';

interface EventoCountdownProps {
  dataInicio: string;
  horaInicio: string;
  status?: StatusEvento;
}

export function EventoCountdown({ dataInicio, horaInicio, status }: EventoCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${dataInicio}T${horaInicio}`);
      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dataInicio, horaInicio]);

  if (!timeLeft) {
    const mensagemPorStatus: Record<string, string> = {
      em_execucao: '🟢 Evento em andamento',
      finalizado: '✅ Evento finalizado',
      arquivado: '📦 Evento arquivado',
      cancelado: '❌ Evento cancelado',
    };

    const mensagem = status && mensagemPorStatus[status] 
      ? mensagemPorStatus[status]
      : '⏰ Evento iniciado';

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{mensagem}</span>
      </div>
    );
  }

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
