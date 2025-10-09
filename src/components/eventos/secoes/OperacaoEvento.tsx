import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventoTimeline } from '@/components/shared/EventoTimeline';

interface OperacaoEventoProps {
  evento: Evento;
  permissions: any;
}

export function OperacaoEvento({ evento }: OperacaoEventoProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipe Alocada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evento.equipe.map((membro) => (
              <div key={membro.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{membro.nome}</p>
                  <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                </div>
                <p className="text-sm">{membro.telefone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline Operacional</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoTimeline timeline={evento.timeline} />
        </CardContent>
      </Card>

      {evento.observacoesOperacionais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evento.observacoesOperacionais.map((obs, i) => (
                <li key={i} className="text-sm p-2 bg-muted rounded">{obs}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
