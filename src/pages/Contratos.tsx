import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContratos } from '@/contexts/ContratosContext';

export default function Contratos() {
  const { contratos, templates } = useContratos();

  const statusColors = {
    rascunho: 'bg-gray-500',
    em_revisao: 'bg-blue-500',
    aguardando_assinatura: 'bg-yellow-500',
    assinado: 'bg-green-500',
    cancelado: 'bg-red-500',
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">Gestão de contratos e templates</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contratos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assinados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contratos.filter(c => c.status === 'assinado').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {contratos.filter(c => c.status === 'aguardando_assinatura').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contratos">
          <TabsList>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="contratos" className="space-y-4">
            <div className="grid gap-4">
              {contratos.map((contrato) => (
                <Card key={contrato.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{contrato.titulo}</CardTitle>
                          <p className="text-sm text-muted-foreground">{contrato.numero}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[contrato.status]}>
                        {contrato.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span> {contrato.tipo}
                      </div>
                      {contrato.valor && (
                        <div>
                          <span className="text-muted-foreground">Valor:</span> R$ {contrato.valor.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Assinaturas:</span>{' '}
                        {contrato.assinaturas.filter(a => a.assinado).length}/{contrato.assinaturas.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.descricao}</p>
                  </CardHeader>
                  <CardContent>
                    <Badge>{template.tipo}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
