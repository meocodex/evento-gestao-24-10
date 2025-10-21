import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Demanda } from '@/types/demandas';
import { DemandaCard } from './DemandaCard';

interface DemandasVirtualListProps {
  demandas: Demanda[];
  onDetalhes: (demanda: Demanda) => void;
  onEditar: (demanda: Demanda) => void;
  onExcluir: (demanda: Demanda) => void;
}

export function DemandasVirtualList({ 
  demandas, 
  onDetalhes, 
  onEditar, 
  onExcluir 
}: DemandasVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: demandas.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 3,
  });

  return (
    <div ref={parentRef} className="h-[calc(100vh-500px)] overflow-auto">
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
                onDetalhes={() => onDetalhes(demanda)}
                onEditar={() => onEditar(demanda)}
                onExcluir={() => onExcluir(demanda)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
