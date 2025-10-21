import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Contrato, StatusContrato } from '@/types/contratos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, FileSignature, Eye, Edit, CheckCircle2, Trash2, MoreVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  contratos: Contrato[];
  loading?: boolean;
  statusColors: Record<StatusContrato, string>;
  statusLabels: Record<StatusContrato, string>;
  onDetalhes: (contrato: Contrato) => void;
  onEditar: (contrato: Contrato) => void;
  onConverter: (contrato: Contrato) => void;
  onExcluir: (contrato: Contrato) => void;
}

export function ContratosVirtualList({
  contratos,
  loading,
  statusColors,
  statusLabels,
  onDetalhes,
  onEditar,
  onConverter,
  onExcluir,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: contratos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 3,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  if (contratos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum contrato ou proposta encontrado</p>
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
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const contrato = contratos[virtualItem.index];
          const isProposta = ['proposta', 'em_negociacao', 'aprovada'].includes(contrato.status);
          const Icon = isProposta ? FileText : FileSignature;

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                paddingBottom: '1rem',
              }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{contrato.titulo}</CardTitle>
                        <p className="text-sm text-muted-foreground">{contrato.numero}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[contrato.status]}>
                        {statusLabels[contrato.status]}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDetalhes(contrato)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {(contrato.status === 'rascunho' || contrato.status === 'em_revisao' || contrato.status === 'proposta') && (
                            <DropdownMenuItem onClick={() => onEditar(contrato)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {contrato.status === 'aprovada' && (
                            <DropdownMenuItem onClick={() => onConverter(contrato)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Converter em Contrato
                            </DropdownMenuItem>
                          )}
                          {contrato.status !== 'assinado' && (
                            <DropdownMenuItem
                              onClick={() => onExcluir(contrato)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>{' '}
                      <span className="capitalize">{contrato.tipo}</span>
                    </div>
                    {contrato.valor && (
                      <div>
                        <span className="text-muted-foreground">Valor:</span>{' '}
                        {contrato.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    )}
                    {isProposta && contrato.itens && (
                      <div>
                        <span className="text-muted-foreground">Itens:</span> {contrato.itens.length}
                      </div>
                    )}
                    {!isProposta && (
                      <div>
                        <span className="text-muted-foreground">Assinaturas:</span>{' '}
                        {contrato.assinaturas.filter(a => a.assinado).length}/{contrato.assinaturas.length}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
