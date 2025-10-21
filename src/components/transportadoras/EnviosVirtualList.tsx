import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Envio } from '@/types/transportadoras';
import { EnvioCard } from './EnvioCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  envios: Envio[];
  loading?: boolean;
  title: string;
  emptyMessage?: string;
}

export function EnviosVirtualList({ envios, loading, title, emptyMessage }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: Math.ceil(envios.length / 2),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2,
  });

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {envios.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage || 'Nenhum envio encontrado'}</p>
      ) : (
        <div ref={parentRef} className="h-[calc(50vh-250px)] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * 2;
              const rowEnvios = envios.slice(startIndex, startIndex + 2);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {rowEnvios.map((envio) => (
                      <EnvioCard key={envio.id} envio={envio} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
