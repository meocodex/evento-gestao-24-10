import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CheckCircle2, Clock, Package, Truck, Users, FileText, Download, Printer, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Evento } from "@/types/eventos";
import { AdicionarMaterialDialog } from "../modals/AdicionarMaterialDialog";
import { AlocarMaterialDialog } from "../modals/AlocarMaterialDialog";
import { DevolverMaterialDialog } from "../modals/DevolverMaterialDialog";
import { DevolverMaterialLoteDialog } from "../modals/DevolverMaterialLoteDialog";
import { RegistrarRetiradaDialog } from "../modals/RegistrarRetiradaDialog";
import { GerarDeclaracaoTransporteDialog } from "../modals/GerarDeclaracaoTransporteDialog";
import { VincularFreteDialog } from "../modals/VincularFreteDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useEventosMateriaisAlocados } from "@/contexts/eventos/useEventosMateriaisAlocados";
import { useEventosChecklist } from "@/hooks/eventos";

interface MateriaisEventoProps {
  evento: Evento;
  permissions: any;
}

export function MateriaisEvento({ evento, permissions }: MateriaisEventoProps) {
  const [showAdicionarMaterial, setShowAdicionarMaterial] = useState(false);
  const [showAlocarMaterial, setShowAlocarMaterial] = useState(false);
  const [showDevolverMaterial, setShowDevolverMaterial] = useState(false);
  const [showDevolverLote, setShowDevolverLote] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [materialParaDevolucao, setMaterialParaDevolucao] = useState<any>(null);
  const [materiaisParaDevolucao, setMateriaisParaDevolucao] = useState<any[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'checklist' | 'alocado' } | null>(null);
  const [filtroDocumento, setFiltroDocumento] = useState<'todos' | 'sem-documento' | 'com-documento' | 'equipe-tecnica'>('todos');
  const [showGerarRetroativo, setShowGerarRetroativo] = useState(false);
  const [showGerarDeclaracaoRetroativo, setShowGerarDeclaracaoRetroativo] = useState(false);
  const [materiaisRetroativos, setMateriaisRetroativos] = useState<any[]>([]);
  const [showConfirmReimprimir, setShowConfirmReimprimir] = useState(false);
  const [materialReimprimir, setMaterialReimprimir] = useState<any>(null);
  const [showVincularFrete, setShowVincularFrete] = useState(false);

  const { checklist: checklistData = [], loading: loadingChecklist } = useEventosChecklist(evento.id);
  const { 
    materiaisAlocados, 
    loading: loadingAlocados, 
    removerMaterialAlocado,
    registrarRetirada,
    gerarDeclaracaoTransporte,
    reimprimirDocumento,
    vincularMaterialesAFrete,
  } = useEventosMateriaisAlocados(evento.id);

  // Filtrar materiais pendentes
  const materiaisPendentes = materiaisAlocados.filter(
    (m: any) => !m.devolvido && m.tipo_envio === 'antecipado'
  );

  // Aplicar filtros
  const materiaisFiltrados = materiaisAlocados.filter((m: any) => {
    const temDocumento = m.termoRetiradaUrl || m.declaracaoTransporteUrl;
    
    if (filtroDocumento === 'sem-documento') {
      return m.tipo_envio === 'antecipado' && !temDocumento;
    }
    if (filtroDocumento === 'com-documento') {
      return temDocumento;
    }
    if (filtroDocumento === 'equipe-tecnica') {
      return m.tipo_envio === 'com_tecnicos';
    }
    return true;
  });

  // Contadores para os filtros
  const contadores = {
    todos: materiaisAlocados.length,
    'sem-documento': materiaisAlocados.filter((m: any) => 
      m.tipo_envio === 'antecipado' && !m.termoRetiradaUrl && !m.declaracaoTransporteUrl
    ).length,
    'com-documento': materiaisAlocados.filter((m: any) => 
      m.termoRetiradaUrl || m.declaracaoTransporteUrl
    ).length,
    'equipe-tecnica': materiaisAlocados.filter((m: any) => 
      m.tipo_envio === 'com_tecnicos'
    ).length,
  };

  // Materiais sem documento para geração retroativa
  const materiaisSemDocumento = materiaisAlocados.filter((m: any) =>
    m.tipo_envio === 'antecipado' && !m.termoRetiradaUrl && !m.declaracaoTransporteUrl
  );

  // Materiais elegíveis para vincular a frete
  const materiaisParaFrete = materiaisAlocados.filter((m: any) =>
    m.tipo_envio === 'antecipado' && !m.envio_id && !m.devolvido
  );

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await removerMaterialAlocado.mutateAsync(itemToDelete.id);
      setShowConfirmDelete(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(`Erro ao remover: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">
            <Package className="h-4 w-4 mr-2" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="alocacao">
            <Truck className="h-4 w-4 mr-2" />
            Alocação
          </TabsTrigger>
          <TabsTrigger value="devolucoes">
            <Clock className="h-4 w-4 mr-2" />
            Devoluções
            {materiaisPendentes.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {materiaisPendentes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Materiais necessários para o evento
            </p>
            {permissions.canEdit && (
              <Button size="sm" onClick={() => setShowAdicionarMaterial(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>

          {loadingChecklist ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : checklistData.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum material no checklist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checklistData.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantidade}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.alocado >= item.quantidade ? 'default' : 'secondary'}>
                          {item.alocado}/{item.quantidade}
                        </Badge>
                        {permissions.canEdit && item.alocado < item.quantidade && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setItemSelecionado(item);
                              setShowAlocarMaterial(true);
                            }}
                          >
                            Alocar
                          </Button>
                        )}
                        {permissions.canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setItemToDelete({ id: item.id, type: 'checklist' });
                              setShowConfirmDelete(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Alocação Tab */}
        <TabsContent value="alocacao" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Select value={filtroDocumento} onValueChange={(value: any) => setFiltroDocumento(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    Todos ({contadores.todos})
                  </SelectItem>
                  <SelectItem value="sem-documento">
                    Sem Documento ({contadores['sem-documento']})
                  </SelectItem>
                  <SelectItem value="com-documento">
                    Com Documento ({contadores['com-documento']})
                  </SelectItem>
                  <SelectItem value="equipe-tecnica">
                    Equipe Técnica ({contadores['equipe-tecnica']})
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {materiaisSemDocumento.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMateriaisRetroativos(materiaisSemDocumento);
                    // Determinar se precisa termo ou declaração
                    const primeiroMaterial = materiaisSemDocumento[0];
                    if (!primeiroMaterial.transportadora || primeiroMaterial.transportadora.trim() === '') {
                      setShowGerarRetroativo(true);
                    } else {
                      setShowGerarDeclaracaoRetroativo(true);
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Documentos ({materiaisSemDocumento.length})
                </Button>
              )}
              
              {permissions.canEdit && materiaisParaFrete.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowVincularFrete(true)}
                  className="gap-2"
                >
                  <Truck className="h-4 w-4" />
                  Adicionar Frete ({materiaisParaFrete.length})
                </Button>
              )}
            </div>
          </div>

          {materiaisFiltrados.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {filtroDocumento === 'todos' 
                  ? 'Nenhum material alocado' 
                  : 'Nenhum material encontrado com este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Envio Antecipado */}
              {materiaisFiltrados.some((m: any) => m.tipo_envio === 'antecipado') && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-4 w-4" />
                    <h3 className="font-medium">Envio Antecipado</h3>
                  </div>
                  <div className="space-y-2">
                    {materiaisFiltrados
                      .filter((m: any) => m.tipo_envio === 'antecipado')
                      .map((material: any) => {
                        const temDocumento = material.termoRetiradaUrl || material.declaracaoTransporteUrl;

                        return (
                          <Card key={material.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium">{material.nome}</p>
                                    {material.serial && (
                                      <Badge variant="outline">Serial: {material.serial}</Badge>
                                    )}
                                    
                                    {/* Badge de status do documento */}
                                    {temDocumento ? (
                                      <Badge variant="default" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Documento Gerado
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Sem Documento
                                      </Badge>
                                    )}
                                    
                                    {material.envio_id && (
                                      <Badge variant="outline" className="gap-1 bg-blue-50 border-blue-300 text-blue-700">
                                        <Truck className="h-3 w-3" />
                                        Frete #{material.envio_id.substring(0, 8)}
                                      </Badge>
                                    )}
                                    
                                    {material.devolvido && (
                                      <Badge variant="default">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Devolvido
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {material.transportadora && (
                                    <p className="text-sm text-muted-foreground">
                                      Transportadora: {material.transportadora}
                                    </p>
                                  )}
                                  
                                  {/* Botões de ação */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {material.termoRetiradaUrl && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(material.termoRetiradaUrl, '_blank')}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Baixar Termo
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setMaterialReimprimir(material);
                                            setShowConfirmReimprimir(true);
                                          }}
                                        >
                                          <Printer className="h-4 w-4 mr-2" />
                                          Reimprimir
                                        </Button>
                                      </>
                                    )}
                                    
                                    {material.declaracaoTransporteUrl && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(material.declaracaoTransporteUrl, '_blank')}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Baixar Declaração
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setMaterialReimprimir(material);
                                            setShowConfirmReimprimir(true);
                                          }}
                                        >
                                          <Printer className="h-4 w-4 mr-2" />
                                          Reimprimir
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {permissions.canEdit && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setItemToDelete({ id: material.id, type: 'alocado' });
                                      setShowConfirmDelete(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Com Técnicos */}
              {materiaisFiltrados.some((m: any) => m.tipo_envio === 'com_tecnicos') && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    <h3 className="font-medium">Com Técnicos</h3>
                  </div>
                  <div className="space-y-2">
                    {materiaisFiltrados
                      .filter((m: any) => m.tipo_envio === 'com_tecnicos')
                      .map((material: any) => (
                        <Card key={material.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{material.nome}</p>
                                  {material.serial && (
                                    <Badge variant="outline">Serial: {material.serial}</Badge>
                                  )}
                                  <Badge variant="outline">Equipe Técnica</Badge>
                                </div>
                                {material.responsavel && (
                                  <p className="text-sm text-muted-foreground">
                                    Responsável: {material.responsavel}
                                  </p>
                                )}
                              </div>
                              {permissions.canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setItemToDelete({ id: material.id, type: 'alocado' });
                                    setShowConfirmDelete(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Devoluções Tab */}
        <TabsContent value="devolucoes" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Materiais pendentes de devolução
            </p>
            {materiaisPendentes.length > 1 && (
              <Button size="sm" variant="outline" onClick={() => setShowDevolverLote(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Devolver em Lote ({materiaisPendentes.length})
              </Button>
            )}
          </div>

          {loadingAlocados ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : materiaisPendentes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma devolução pendente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materiaisPendentes.map((material: any) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{material.nome}</p>
                          <Badge variant="secondary">Pendente</Badge>
                        </div>
                        {material.serial && (
                          <p className="text-sm text-muted-foreground">Serial: {material.serial}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {material.tipo_envio === 'antecipado' 
                            ? `Envio antecipado${material.transportadora ? ` via ${material.transportadora}` : ''}`
                            : `Com técnicos${material.responsavel ? ` - ${material.responsavel}` : ''}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMaterialParaDevolucao(material);
                          setShowDevolverMaterial(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Registrar Devolução
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AdicionarMaterialDialog
        open={showAdicionarMaterial}
        onOpenChange={setShowAdicionarMaterial}
        onAdicionar={(data) => {
          setShowAdicionarMaterial(false);
        }}
        itensJaNoChecklist={checklistData.map((item: any) => item.item_id)}
      />

      {itemSelecionado && (
        <AlocarMaterialDialog
          open={showAlocarMaterial}
          onOpenChange={setShowAlocarMaterial}
          eventoId={evento.id}
          itemId={itemSelecionado.item_id}
          materialNome={itemSelecionado.nome}
          quantidadeNecessaria={itemSelecionado.quantidade}
          quantidadeJaAlocada={itemSelecionado.alocado}
          onAlocar={() => {
            setShowAlocarMaterial(false);
            setItemSelecionado(null);
          }}
        />
      )}

      <DevolverMaterialDialog
        open={showDevolverMaterial}
        onOpenChange={setShowDevolverMaterial}
        material={materialParaDevolucao}
        onConfirmar={(dados) => {
          setShowDevolverMaterial(false);
        }}
      />

      <DevolverMaterialLoteDialog
        open={showDevolverLote}
        onOpenChange={setShowDevolverLote}
        materiais={materiaisPendentes}
        onConfirmar={async (materiaisIds, statusDevolucao, observacoes, fotos) => {
          setShowDevolverLote(false);
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        description={
          itemToDelete?.type === 'checklist'
            ? "Tem certeza que deseja remover este item do checklist?"
            : "Tem certeza que deseja remover este material alocado?"
        }
      />

      {/* Dialog de Geração Retroativa - Termo de Retirada */}
      <RegistrarRetiradaDialog
        open={showGerarRetroativo}
        onOpenChange={setShowGerarRetroativo}
        materiais={materiaisRetroativos}
        onConfirmar={async (dados) => {
          try {
            const { retiradoPorNome, retiradoPorDocumento, retiradoPorTelefone } = dados;
            await registrarRetirada.mutateAsync({
              alocacaoIds: materiaisRetroativos.map(m => m.id),
              retiradoPorNome,
              retiradoPorDocumento,
              retiradoPorTelefone,
            });
            toast.success('Termos de retirada gerados com sucesso!');
            setShowGerarRetroativo(false);
            setMateriaisRetroativos([]);
          } catch (error: any) {
            toast.error(`Erro ao gerar termos: ${error.message}`);
          }
        }}
      />

      {/* Dialog de Geração Retroativa - Declaração de Transporte */}
      <GerarDeclaracaoTransporteDialog
        open={showGerarDeclaracaoRetroativo}
        onOpenChange={setShowGerarDeclaracaoRetroativo}
        materiais={materiaisRetroativos}
        cliente={evento.cliente}
        transportadora={materiaisRetroativos[0]?.transportadora}
        onConfirmar={async (dados) => {
          try {
            await gerarDeclaracaoTransporte.mutateAsync({
              alocacaoIds: materiaisRetroativos.map(m => m.id),
              remetenteTipo: dados.remetenteTipo || 'empresa',
              remetenteMembroId: dados.remetenteMembroId,
              valoresDeclarados: dados.valoresDeclarados || {},
              observacoes: dados.observacoes,
            });
            toast.success('Declarações de transporte geradas com sucesso!');
            setShowGerarDeclaracaoRetroativo(false);
            setMateriaisRetroativos([]);
          } catch (error: any) {
            toast.error(`Erro ao gerar declarações: ${error.message}`);
          }
        }}
      />

      {/* Confirm Dialog - Reimprimir */}
      <ConfirmDialog
        open={showConfirmReimprimir}
        onOpenChange={setShowConfirmReimprimir}
        onConfirm={async () => {
          if (!materialReimprimir) return;
          
          try {
            const tipoDocumento = materialReimprimir.termoRetiradaUrl ? 'termo' : 'declaracao';
            await reimprimirDocumento.mutateAsync({
              materialId: materialReimprimir.id,
              tipoDocumento,
            });
            toast.success('Documento reimpresso com sucesso!');
            setShowConfirmReimprimir(false);
            setMaterialReimprimir(null);
          } catch (error: any) {
            toast.error(`Erro ao reimprimir: ${error.message}`);
          }
        }}
        title="Reimprimir documento"
        description="O documento anterior será substituído pelo novo. Deseja continuar?"
      />

      {/* Dialog Vincular Frete */}
      <VincularFreteDialog
        open={showVincularFrete}
        onOpenChange={setShowVincularFrete}
        evento={evento}
        materiais={materiaisParaFrete}
        onVincular={vincularMaterialesAFrete}
      />
    </div>
  );
}
