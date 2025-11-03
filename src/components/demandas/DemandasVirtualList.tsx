import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Demanda } from '@/types/demandas';
import { DemandaCard } from './DemandaCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

interface DemandasVirtualListProps {
  demandas: Demanda[];
  onClick: (demanda: Demanda) => void;
}

export function DemandasVirtualList({ 
  demandas, 
  onClick 
}: DemandasVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: demandas.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 3,
  });

  if (demandas.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-500px)] overflow-auto"
      style={{ contain: 'strict' }}>
      <div 
        style={{ 
          height: `${rowVirtualizer.getTotalSize()}px`, 
          position: 'relative',
          width: '100%'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const demanda = demandas[virtualRow.index];
          return (
            <div
              key={demanda.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <DemandaCard
                demanda={demanda}
                onClick={() => onClick(demanda)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
