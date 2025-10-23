import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { MaterialEstoque } from '@/types/estoque';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

interface EstoqueVirtualListProps {
  materiais: any[];
  loading?: boolean;
  onVerDetalhes: (material: MaterialEstoque) => void;
  onEditar: (material: MaterialEstoque) => void;
  onExcluir: (material: MaterialEstoque) => void;
}

export function EstoqueVirtualList({
  materiais,
  loading = false,
  onVerDetalhes,
  onEditar,
  onExcluir,
}: EstoqueVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: materiais.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-400px)] overflow-auto rounded-lg border">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const material = materiais[virtualRow.index];
          const emUso = material.seriais?.filter((s: any) => s.status === 'em-uso').length || 0;
          const manutencao = material.seriais?.filter((s: any) => s.status === 'manutencao').length || 0;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-4 border-b hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 h-full">
                <div className="font-mono text-sm text-muted-foreground w-24 flex-shrink-0">
                  {material.id}
                </div>
                <div className="flex-1 font-medium truncate">
                  {material.nome}
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {material.categoria}
                </Badge>
                <div className="flex items-center gap-4 text-sm flex-shrink-0">
                  <div className="text-center w-16">
                    <span className="font-semibold">{material.quantidade_total || 0}</span>
                  </div>
                  <div className="text-center w-16">
                    <span className="text-green-600 font-semibold">
                      {material.quantidade_disponivel || 0}
                    </span>
                  </div>
                  <div className="text-center w-16">
                    <span className="text-orange-600 font-semibold">{emUso}</span>
                  </div>
                  <div className="text-center w-16">
                    <span className="text-destructive font-semibold">{manutencao}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onVerDetalhes(material)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditar(material)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onExcluir(material)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
