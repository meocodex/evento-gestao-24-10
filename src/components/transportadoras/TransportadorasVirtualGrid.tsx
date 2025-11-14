import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Transportadora } from '@/types/transportadoras';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  transportadoras: Transportadora[];
  loading?: boolean;
  onDetalhes: (t: Transportadora) => void;
  onRotas: (t: Transportadora) => void;
  onEditar: (t: Transportadora) => void;
  onExcluir: (t: Transportadora) => void;
}

export function TransportadorasVirtualGrid({
  transportadoras,
  loading,
  onDetalhes,
  onRotas,
  onEditar,
  onExcluir,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const itemsPerRow = 3;
  const virtualizer = useVirtualizer({
    count: Math.ceil(transportadoras.length / itemsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 2,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px]" />
        ))}
      </div>
    );
  }

  if (transportadoras.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma transportadora encontrada</p>
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
          const startIndex = virtualRow.index * itemsPerRow;
          const rowTransportadoras = transportadoras.slice(startIndex, startIndex + itemsPerRow);

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-3">
                {rowTransportadoras.map((transportadora) => (
                  <Card key={transportadora.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{transportadora.nome}</CardTitle>
                            <CardDescription>{transportadora.cnpj}</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant={transportadora.status === 'ativa' ? 'default' : 'secondary'}>
                            {transportadora.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {transportadora.rotasAtendidas.filter(r => r.ativa).length} rotas
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Responsável:</span>{' '}
                          {transportadora.responsavel}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Telefone:</span>{' '}
                          {transportadora.telefone}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{' '}
                          {transportadora.email}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cidade:</span>{' '}
                          {transportadora.endereco.cidade} - {transportadora.endereco.estado}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => onDetalhes(transportadora)}>
                          Detalhes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onRotas(transportadora)}>
                          <MapPin className="h-4 w-4 mr-1" />
                          Rotas
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEditar(transportadora)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onExcluir(transportadora)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
