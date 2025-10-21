import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Cliente } from '@/types/eventos';
import { ClienteCard } from './ClienteCard';

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

  return (
    <div ref={parentRef} className="h-[calc(100vh-400px)] overflow-auto">
      <div 
        style={{ 
          height: `${rowVirtualizer.getTotalSize()}px`, 
          position: 'relative',
          width: '100%'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const cliente = clientes[virtualRow.index];
          return (
            <div
              key={cliente.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
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
    </div>
  );
}
