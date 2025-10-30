import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, PackagePlus, Trash2, RotateCcw, CheckSquare, FileText, AlertCircle, Download } from 'lucide-react';
import { AdicionarMaterialDialog } from '../modals/AdicionarMaterialDialog';
import { AlocarMaterialDialog } from '../modals/AlocarMaterialDialog';
import { DevolverMaterialDialog } from '../modals/DevolverMaterialDialog';
import { DevolverMaterialLoteDialog } from '../modals/DevolverMaterialLoteDialog';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEventosMateriaisAlocados, useEventosChecklist } from '@/hooks/eventos';
import { MaterialAlocado } from '@/types/estoque';

interface MateriaisEventoProps {
  evento: Evento;
  permissions: any;
}

export function MateriaisEvento({ evento, permissions }: MateriaisEventoProps) {
  const materiaisAlocados = useEventosMateriaisAlocados(evento.id);
  const checklistHook = useEventosChecklist(evento.id);
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
  const [showDevolverMaterial, setShowDevolverMaterial] = useState(false);
  const [materialParaDevolver, setMaterialParaDevolver] = useState<MaterialAlocado | null>(null);
  const [showDevolverLote, setShowDevolverLote] = useState(false);

  const handleAlocarClick = (item: any) => {
    setSelectedMaterial({
      itemId: item.item_id,
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
        checklistHook.removerMaterialChecklist.mutate(itemToDelete.id);
      } else {
        materiaisAlocados.removerMaterialAlocado.mutate(itemToDelete.id);
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
        <TabsTrigger value="devolucoes">
          Devoluções
          {materiaisAlocados.materiaisAlocados.filter((m: any) => m.status_devolucao === 'pendente').length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {materiaisAlocados.materiaisAlocados.filter((m: any) => m.status_devolucao === 'pendente').length}
            </Badge>
          )}
        </TabsTrigger>
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
            {checklistHook.loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Carregando materiais...
              </p>
            ) : checklistHook.checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum material adicionado ao checklist
              </p>
            ) : (
              <div className="space-y-2">
                {checklistHook.checklist.map((item) => (
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
                  {evento.materiaisAlocados.antecipado.map((item) => {
                    const temDocumento = item.termoRetiradaUrl || item.declaracaoTransporteUrl;
                    
                    return (
                      <div key={item.id} className="p-3 border rounded space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{item.nome}</p>
                              {temDocumento ? (
                                <Badge variant="default" className="gap-1">
                                  <FileText className="h-3 w-3" />
                                  Documento OK
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Sem Documento
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Serial: {item.serial}</p>
                            <p className="text-sm">Transportadora: {item.transportadora || 'Retirada por terceiro'}</p>
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
                        
                        {/* Botões de Documento */}
                        <div className="flex gap-2 flex-wrap">
                          {item.termoRetiradaUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.termoRetiradaUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Termo de Retirada
                            </Button>
                          )}
                          {item.declaracaoTransporteUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.declaracaoTransporteUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Declaração de Transporte
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                    <div key={item.id} className="p-3 border rounded space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{item.nome}</p>
                            <Badge variant="outline">Equipe Técnica</Badge>
                          </div>
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="devolucoes" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Devoluções Pendentes</CardTitle>
            {materiaisAlocados.materiaisAlocados.filter((m: any) => m.status_devolucao === 'pendente').length > 1 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowDevolverLote(true)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Devolução em Lote ({materiaisAlocados.materiaisAlocados.filter((m: any) => m.status_devolucao === 'pendente').length})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {materiaisAlocados.loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Carregando materiais...
              </p>
            ) : materiaisAlocados.materiaisAlocados.filter((m: any) => m.status_devolucao === 'pendente').length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma devolução pendente
              </p>
            ) : (
              <div className="space-y-3">
                {materiaisAlocados.materiaisAlocados
                  .filter((m: any) => m.status_devolucao === 'pendente')
                  .map((material: any) => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{material.nome}</p>
                              <Badge variant="warning">Pendente</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {material.serial || `${material.quantidade_alocada || 1} unidades`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Envio: {material.tipo_envio === 'antecipado' 
                                ? `Antecipado${material.transportadora ? ` via ${material.transportadora}` : ''}`
                                : `Com Técnicos${material.responsavel ? ` - ${material.responsavel}` : ''}`
                              }
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setMaterialParaDevolver({
                                id: material.id,
                                eventoId: material.evento_id,
                                itemId: material.item_id,
                                nome: material.nome,
                                serial: material.serial,
                                tipoEnvio: material.tipo_envio,
                                transportadora: material.transportadora,
                                responsavel: material.responsavel,
                                quantidadeAlocada: material.quantidade_alocada || 1,
                                quantidadeDevolvida: material.quantidade_devolvida || 0,
                                statusDevolucao: material.status_devolucao,
                              });
                              setShowDevolverMaterial(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Registrar Devolução
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <AdicionarMaterialDialog
      open={showAddMaterial}
      onOpenChange={setShowAddMaterial}
      onAdicionar={(data) => {
        checklistHook.adicionarMaterialChecklist.mutate(data);
        setShowAddMaterial(false);
      }}
      itensJaNoChecklist={checklistHook.checklist.map(item => item.item_id)}
    />

    {selectedMaterial && (
      <AlocarMaterialDialog
        open={showAlocarMaterial}
        onOpenChange={setShowAlocarMaterial}
        eventoId={evento.id}
        itemId={selectedMaterial.itemId}
        materialNome={selectedMaterial.nome}
        quantidadeNecessaria={selectedMaterial.quantidadeNecessaria}
        quantidadeJaAlocada={selectedMaterial.quantidadeJaAlocada}
        onAlocar={(data) => {
          materiaisAlocados.alocarMaterial.mutate({
            item_id: data.itemId,
            nome: selectedMaterial.nome,
            serial: data.serial,
            status: 'reservado',
            tipo_envio: data.tipoEnvio,
            ...(data.tipoEnvio === 'antecipado' 
              ? { 
                  transportadora: data.transportadora!, 
                  data_envio: new Date().toISOString().split('T')[0],
                } 
              : { 
                  responsavel: data.responsavel! 
                }
            ),
          });
          setShowAlocarMaterial(false);
          setSelectedMaterial(null);
        }}
      />
    )}

    <DevolverMaterialDialog
      material={materialParaDevolver}
      open={showDevolverMaterial}
      onOpenChange={setShowDevolverMaterial}
      onConfirmar={(dados) => {
        if (materialParaDevolver) {
          materiaisAlocados.registrarDevolucao.mutate({
            alocacaoId: materialParaDevolver.id,
            statusDevolucao: dados.statusDevolucao,
            observacoes: dados.observacoes,
            fotos: dados.fotos,
          });
          setShowDevolverMaterial(false);
          setMaterialParaDevolver(null);
        }
      }}
    />

    <DevolverMaterialLoteDialog
      materiais={materiaisAlocados.materiaisAlocados
        .filter((m: any) => m.status_devolucao === 'pendente')
        .map((m: any) => ({
          id: m.id,
          eventoId: m.evento_id,
          itemId: m.item_id,
          nome: m.nome,
          serial: m.serial,
          tipoEnvio: m.tipo_envio,
          transportadora: m.transportadora,
          responsavel: m.responsavel,
          quantidadeAlocada: m.quantidade_alocada || 1,
          quantidadeDevolvida: m.quantidade_devolvida || 0,
          statusDevolucao: m.status_devolucao,
        }))}
      open={showDevolverLote}
      onOpenChange={setShowDevolverLote}
      onConfirmar={async (materiaisIds, statusDevolucao, observacoes, fotos) => {
        // Processar devoluções em lote
        for (const materialId of materiaisIds) {
          await materiaisAlocados.registrarDevolucao.mutateAsync({
            alocacaoId: materialId,
            statusDevolucao,
            observacoes,
            fotos,
          });
        }
      }}
    />

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
