import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { OperacionalEquipe } from '@/types/equipe';
import { OperacionalCard } from './OperacionalCard';
import { Skeleton } from '@/components/ui/skeleton';

interface OperacionalVirtualListProps {
  operacionais: OperacionalEquipe[];
  loading?: boolean;
  onDetalhes: (operacional: OperacionalEquipe) => void;
  onEditar: (operacional: OperacionalEquipe) => void;
}

export function OperacionalVirtualList({
  operacionais,
  loading,
  onDetalhes,
  onEditar,
}: OperacionalVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: operacionais.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  if (operacionais.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum membro operacional encontrado
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-450px)] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const operacional = operacionais[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <OperacionalCard
                  operacional={operacional}
                  onDetalhes={() => onDetalhes(operacional)}
                  onEditar={() => onEditar(operacional)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
