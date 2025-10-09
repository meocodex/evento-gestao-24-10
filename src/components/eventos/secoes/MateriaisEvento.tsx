import { Evento } from '@/types/eventos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MateriaisEventoProps {
  evento: Evento;
  permissions: any;
}

export function MateriaisEvento({ evento }: MateriaisEventoProps) {
  return (
    <Tabs defaultValue="checklist">
      <TabsList>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="alocacao">Alocação</TabsTrigger>
      </TabsList>

      <TabsContent value="checklist" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Materiais Necessários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {evento.checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">Quantidade: {item.quantidade}</p>
                  </div>
                  <Badge variant={item.alocado >= item.quantidade ? 'default' : 'secondary'}>
                    {item.alocado}/{item.quantidade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alocacao" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Envio Antecipado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {evento.materiaisAlocados.antecipado.map((item) => (
                  <div key={item.id} className="p-3 border rounded">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">Serial: {item.serial}</p>
                    <p className="text-sm">Transportadora: {item.transportadora}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Com Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {evento.materiaisAlocados.comTecnicos.map((item) => (
                  <div key={item.id} className="p-3 border rounded">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">Serial: {item.serial}</p>
                    <p className="text-sm">Responsável: {item.responsavel}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
