import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Cliente } from '@/types/eventos';
import { ClienteCard } from './ClienteCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

interface ClientesVirtualListProps {
  clientes: Cliente[];
  onView: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

export function ClientesVirtualList({ 
  clientes, 
  onView, 
  onEdit, 
  onDelete 
}: ClientesVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: clientes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  if (clientes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-400px)] overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      style={{ contain: 'strict' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const cliente = clientes[virtualRow.index];
        return (
          <div
            key={cliente.id}
            style={{
              height: `${virtualRow.size}px`,
            }}
          >
            <ClienteCard
              cliente={cliente}
              onView={() => onView(cliente)}
              onEdit={() => onEdit(cliente)}
              onDelete={() => onDelete(cliente)}
            />
          </div>
        );
      })}
    </div>
  );
}
