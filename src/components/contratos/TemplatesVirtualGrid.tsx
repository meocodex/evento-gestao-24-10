import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ContratoTemplate } from '@/types/contratos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  templates: ContratoTemplate[];
  loading?: boolean;
  onDetalhes: (template: ContratoTemplate) => void;
  onEditar: (template: ContratoTemplate) => void;
  onExcluir: (template: ContratoTemplate) => void;
}

export function TemplatesVirtualGrid({
  templates,
  loading,
  onDetalhes,
  onEditar,
  onExcluir,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: Math.ceil(templates.length / 2),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 2,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px]" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="col-span-2 text-center py-12 text-muted-foreground">
        <p>Nenhum template encontrado</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-450px)] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * 2;
          const rowTemplates = templates.slice(startIndex, startIndex + 2);

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
                {rowTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{template.nome}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{template.descricao}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDetalhes(template)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditar(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onExcluir(template)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge className="capitalize">{template.tipo}</Badge>
                        <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                        {template.papelTimbrado && (
                          <Badge variant="outline">📄 Com Timbrado</Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          v{template.versao}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
