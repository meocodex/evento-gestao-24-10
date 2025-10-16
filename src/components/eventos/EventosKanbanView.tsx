import { useMemo, useState } from 'react';
import { Evento, StatusEvento } from '@/types/eventos';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEventos } from '@/contexts/EventosContext';
import { toast } from 'sonner';
import { EventoKanbanCard } from './EventoKanbanCard';
import { EventoKanbanColumn } from './EventoKanbanColumn';
import { cn } from '@/lib/utils';

interface EventosKanbanViewProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
}

const statusColumns: { id: StatusEvento; label: string; color: string }[] = [
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', color: 'bg-yellow-500/10 border-yellow-500/20' },
  { id: 'confirmado', label: 'Confirmado', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'aguardando_alocacao', label: 'Aguardando Alocação', color: 'bg-orange-500/10 border-orange-500/20' },
  { id: 'materiais_alocados', label: 'Materiais Alocados', color: 'bg-indigo-500/10 border-indigo-500/20' },
  { id: 'em_preparacao', label: 'Em Preparação', color: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'em_andamento', label: 'Em Andamento', color: 'bg-green-500/10 border-green-500/20' },
  { id: 'aguardando_retorno', label: 'Aguardando Retorno', color: 'bg-cyan-500/10 border-cyan-500/20' },
  { id: 'aguardando_fechamento', label: 'Aguardando Fechamento', color: 'bg-teal-500/10 border-teal-500/20' },
  { id: 'finalizado', label: 'Finalizado', color: 'bg-gray-500/10 border-gray-500/20' },
  { id: 'cancelado', label: 'Cancelado', color: 'bg-red-500/10 border-red-500/20' },
];

export function EventosKanbanView({ eventos, onViewDetails }: EventosKanbanViewProps) {
  const { editarEvento } = useEventos();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const eventosPorStatus = useMemo(() => {
    const grouped: Record<StatusEvento, Evento[]> = {
      orcamento_enviado: [],
      confirmado: [],
      aguardando_alocacao: [],
      materiais_alocados: [],
      em_preparacao: [],
      em_andamento: [],
      aguardando_retorno: [],
      aguardando_fechamento: [],
      finalizado: [],
      cancelado: [],
    };

    eventos.forEach((evento) => {
      grouped[evento.status].push(evento);
    });

    return grouped;
  }, [eventos]);

  const activeEvento = useMemo(
    () => eventos.find((e) => e.id === activeId),
    [activeId, eventos]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const eventoId = active.id as string;
    const newStatus = over.id as StatusEvento;
    const evento = eventos.find((e) => e.id === eventoId);

    if (!evento || evento.status === newStatus) return;

    try {
      await editarEvento(eventoId, { status: newStatus });
      toast.success(`Status alterado para ${statusColumns.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full animate-fade-in">
        {/* Desktop: Grid Horizontal com Scroll */}
        <div className="hidden md:block">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {statusColumns.map((column) => (
              <EventoKanbanColumn
                key={column.id}
                status={column.id}
                label={column.label}
                color={column.color}
                eventos={eventosPorStatus[column.id]}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Tabs com Swipe */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-2 mb-4 snap-x snap-mandatory scrollbar-hide pb-2">
            {statusColumns.map((column) => (
              <button
                key={column.id}
                className={cn(
                  "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium snap-center transition-all",
                  "border-2",
                  column.color
                )}
              >
                {column.label}
                <span className="ml-2 text-xs opacity-70">
                  ({eventosPorStatus[column.id].length})
                </span>
              </button>
            ))}
          </div>

          {/* Colunas empilhadas no mobile */}
          <div className="space-y-4">
            {statusColumns.map((column) => (
              <EventoKanbanColumn
                key={column.id}
                status={column.id}
                label={column.label}
                color={column.color}
                eventos={eventosPorStatus[column.id]}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeEvento ? (
          <div className="rotate-3 scale-105 opacity-80">
            <EventoKanbanCard evento={activeEvento} onViewDetails={onViewDetails} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
