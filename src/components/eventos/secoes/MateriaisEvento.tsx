import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, PackagePlus, Trash2 } from 'lucide-react';
import { AdicionarMaterialDialog } from '../modals/AdicionarMaterialDialog';
import { AlocarMaterialDialog } from '../modals/AlocarMaterialDialog';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEventosMateriaisAlocados, useEventosChecklist } from '@/hooks/eventos';

interface MateriaisEventoProps {
  evento: Evento;
  permissions: any;
}

export function MateriaisEvento({ evento, permissions }: MateriaisEventoProps) {
  const materiaisAlocados = useEventosMateriaisAlocados(evento.id);
  const checklist = useEventosChecklist(evento.id);
  const { toast } = useToast();
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAlocarMaterial, setShowAlocarMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{
    itemId: string;
    nome: string;
    quantidadeNecessaria: number;
    quantidadeJaAlocada: number;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; tipo: 'checklist' | 'alocado' } | null>(null);

  const handleAlocarClick = (item: any) => {
    setSelectedMaterial({
      itemId: item.itemId,
      nome: item.nome,
      quantidadeNecessaria: item.quantidade,
      quantidadeJaAlocada: item.alocado,
    });
    setShowAlocarMaterial(true);
  };

  const handleDeleteClick = (id: string, tipo: 'checklist' | 'alocado') => {
    setItemToDelete({ id, tipo });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.tipo === 'checklist') {
        removerMaterialChecklist(evento.id, itemToDelete.id);
      } else {
        removerMaterialAlocado(evento.id, itemToDelete.id);
      }
      setItemToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
    <Tabs defaultValue="checklist">
      <TabsList>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="alocacao">Alocação</TabsTrigger>
      </TabsList>

      <TabsContent value="checklist" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Materiais Necessários</CardTitle>
            {permissions.canEditChecklist && (
              <Button size="sm" onClick={() => setShowAddMaterial(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {evento.checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum material adicionado ao checklist
              </p>
            ) : (
              <div className="space-y-2">
                {evento.checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">Quantidade: {item.quantidade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.alocado >= item.quantidade ? 'default' : 'secondary'}>
                        {item.alocado}/{item.quantidade}
                      </Badge>
                      {permissions.canAllocate && item.alocado < item.quantidade && (
                        <Button size="sm" variant="outline" onClick={() => handleAlocarClick(item)}>
                          <PackagePlus className="h-4 w-4 mr-2" />
                          Alocar
                        </Button>
                      )}
                      {permissions.canEditChecklist && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteClick(item.id, 'checklist')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {evento.materiaisAlocados.antecipado.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum material alocado para envio antecipado
                </p>
              ) : (
                <div className="space-y-2">
                  {evento.materiaisAlocados.antecipado.map((item) => (
                    <div key={item.id} className="p-3 border rounded flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">Serial: {item.serial}</p>
                        <p className="text-sm">Transportadora: {item.transportadora}</p>
                      </div>
                      {permissions.canAllocate && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteClick(item.id, 'alocado')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Com Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              {evento.materiaisAlocados.comTecnicos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum material alocado com técnicos
                </p>
              ) : (
                <div className="space-y-2">
                  {evento.materiaisAlocados.comTecnicos.map((item) => (
                    <div key={item.id} className="p-3 border rounded flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">Serial: {item.serial}</p>
                        <p className="text-sm">Responsável: {item.responsavel}</p>
                      </div>
                      {permissions.canAllocate && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteClick(item.id, 'alocado')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <AdicionarMaterialDialog
      open={showAddMaterial}
      onOpenChange={setShowAddMaterial}
      onAdicionar={(data) => {
        adicionarMaterialChecklist(evento.id, data);
        setShowAddMaterial(false);
      }}
    />

    {selectedMaterial && (
      <AlocarMaterialDialog
        open={showAlocarMaterial}
        onOpenChange={setShowAlocarMaterial}
        itemId={selectedMaterial.itemId}
        materialNome={selectedMaterial.nome}
        quantidadeNecessaria={selectedMaterial.quantidadeNecessaria}
        quantidadeJaAlocada={selectedMaterial.quantidadeJaAlocada}
        onAlocar={(data) => {
          alocarMaterial(evento.id, data.tipoEnvio, {
            itemId: data.itemId,
            nome: selectedMaterial.nome,
            serial: data.serial,
            status: 'reservado',
            ...(data.tipoEnvio === 'antecipado' 
              ? { 
                  transportadora: data.transportadora!, 
                  dataEnvio: new Date().toISOString(),
                } 
              : { 
                  responsavel: data.responsavel! 
                }
            ),
          } as any);
          setShowAlocarMaterial(false);
          setSelectedMaterial(null);
        }}
      />
    )}

    <ConfirmDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      onConfirm={handleConfirmDelete}
      title="Confirmar Exclusão"
      description="Tem certeza que deseja remover este item?"
    />
    </>
  );
}
