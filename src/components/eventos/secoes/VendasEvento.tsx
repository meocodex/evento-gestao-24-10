import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Evento } from '@/types/eventos';

interface VendasEventoProps {
  evento: Evento;
}

export function VendasEvento({ evento }: VendasEventoProps) {
  if (!evento.configuracaoIngresso) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhuma configuração de ingressos encontrada
      </div>
    );
  }

  const { setores } = evento.configuracaoIngresso;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Setores e Vendas</h3>
        {setores.map((setor) => (
          <Card key={setor.id} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{setor.nome}</CardTitle>
                <Badge variant="outline">Capacidade: {setor.capacidade}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {setor.tiposIngresso.map((tipo) => (
                <div key={tipo.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{tipo.nome}</h4>
                  <div className="space-y-2">
                    {tipo.lotes.map((lote) => {
                      const vendidos = 0; // TODO: integrar com sistema de vendas
                      const percentual = (vendidos / lote.quantidade) * 100;

                      return (
                        <div key={lote.numero} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {lote.numero}º Lote - R$ {lote.preco.toFixed(2)}
                            </span>
                            <span className="font-medium">
                              {vendidos} / {lote.quantidade}
                            </span>
                          </div>
                          <Progress value={percentual} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
