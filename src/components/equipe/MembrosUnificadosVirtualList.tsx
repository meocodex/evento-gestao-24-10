import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { MembroEquipeUnificado } from '@/types/equipe';
import { MembroEquipeCard } from './MembroEquipeCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface MembrosUnificadosVirtualListProps {
  membros: MembroEquipeUnificado[];
  loading?: boolean;
  onDetalhes: (membro: MembroEquipeUnificado) => void;
  onEditar: (membro: MembroEquipeUnificado) => void;
}

export function MembrosUnificadosVirtualList({
  membros,
  loading,
  onDetalhes,
  onEditar,
}: MembrosUnificadosVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: membros.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (membros.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum membro encontrado
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const membro = membros[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="px-1 pb-3">
                <MembroEquipeCard
                  membro={membro}
                  onDetalhes={() => onDetalhes(membro)}
                  onEditar={() => onEditar(membro)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
