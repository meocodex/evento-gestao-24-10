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
  onExcluir: (membro: MembroEquipeUnificado) => void;
  onConcederAcesso?: (membro: MembroEquipeUnificado) => void;
  onGerenciarPermissoes?: (membro: MembroEquipeUnificado) => void;
  canDeleteSystemUsers?: boolean;
}

export function MembrosUnificadosVirtualList({
  membros,
  loading,
  onDetalhes,
  onEditar,
  onExcluir,
  onConcederAcesso,
  onGerenciarPermissoes,
  canDeleteSystemUsers = false,
}: MembrosUnificadosVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: membros.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
    getItemKey: (index) => {
      const m = membros[index];
      return `${m.id}-${m.tipo_membro}-${m.permissions?.length ?? 0}-${m.role ?? 'norole'}`;
    },
    measureElement: (el) => el?.getBoundingClientRect().height,
  });

  if (loading) {
    return (
      <div className="space-y-3">
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
              <div className="px-1 pb-2" ref={rowVirtualizer.measureElement} data-index={virtualItem.index}>
                <MembroEquipeCard
                  membro={membro}
                  onDetalhes={() => onDetalhes(membro)}
                  onEditar={() => onEditar(membro)}
                  onExcluir={() => onExcluir(membro)}
                  onConcederAcesso={onConcederAcesso ? () => onConcederAcesso(membro) : undefined}
                  onGerenciarPermissoes={onGerenciarPermissoes ? () => onGerenciarPermissoes(membro) : undefined}
                  canDeleteSystemUsers={canDeleteSystemUsers}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
