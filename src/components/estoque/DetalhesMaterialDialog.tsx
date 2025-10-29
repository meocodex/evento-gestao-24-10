import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MaterialEstoque, SerialEstoque, useEstoqueSeriais } from '@/hooks/estoque';
import { Package, MapPin, Plus, Trash2, Edit, Loader2, History } from 'lucide-react';
import { useState } from 'react';
import { NovoSerialDialog } from './NovoSerialDialog';
import { EditarMaterialDialog } from './EditarMaterialDialog';
import { EditarSerialDialog } from './EditarSerialDialog';
import { HistoricoMaterialTimeline } from './HistoricoMaterialTimeline';
import { GerenciarQuantidadeDialog } from './GerenciarQuantidadeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEstoque } from '@/hooks/estoque';
import { statusConfig } from '@/lib/estoqueStatus';

interface DetalhesMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialEstoque;
}

export function DetalhesMaterialDialog({
  open, 
  onOpenChange, 
  material 
}: DetalhesMaterialDialogProps) {
  const { excluirSerial } = useEstoque();
  const { data: seriaisAtualizados = [], isLoading: loadingSeriais } = useEstoqueSeriais(material.id);
  const [showNovoSerial, setShowNovoSerial] = useState(false);
  const [showEditarMaterial, setShowEditarMaterial] = useState(false);
  const [showEditarSerial, setShowEditarSerial] = useState(false);
  const [showGerenciarQuantidade, setShowGerenciarQuantidade] = useState(false);
  const [serialParaEditar, setSerialParaEditar] = useState<SerialEstoque | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serialParaExcluir, setSerialParaExcluir] = useState<string | null>(null);

  const isQuantidadeTipo = material.tipoControle === 'quantidade';

  // Calcular estatísticas a partir dos seriais atualizados
  const totalAtualizado = seriaisAtualizados.length;
  const disponivelAtualizado = seriaisAtualizados.filter(s => s.status === 'disponivel').length;
  const emUsoManutencao = totalAtualizado - disponivelAtualizado;

  const handleEditSerial = (serial: SerialEstoque) => {
    setSerialParaEditar(serial);
    setShowEditarSerial(true);
  };

  const handleDeleteSerial = (numeroSerial: string) => {
    setSerialParaExcluir(numeroSerial);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (serialParaExcluir) {
      await excluirSerial.mutateAsync({ materialId: material.id, numeroSerial: serialParaExcluir });
      setSerialParaExcluir(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isQuantidadeTipo ? '🔢' : '📦'}
                {material.nome}
              </div>
              <div className="flex items-center gap-2">
                {isQuantidadeTipo && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setShowGerenciarQuantidade(true)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Gerenciar Quantidade
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowEditarMaterial(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Material
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="geral" className="mt-4">
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              {!isQuantidadeTipo && (
                <TabsTrigger value="seriais">Seriais ({totalAtualizado})</TabsTrigger>
              )}
              <TabsTrigger value="historico">
                <History className="h-4 w-4 mr-2" />
                Histórico Completo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-4">
              <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{material.categoria}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium font-mono">{material.id}</p>
              </div>
            </div>

            <Separator />

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{isQuantidadeTipo ? material.quantidadeTotal : totalAtualizado}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{isQuantidadeTipo ? material.quantidadeDisponivel : disponivelAtualizado}</p>
                <p className="text-sm text-muted-foreground">Disponível</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-destructive">
                  {isQuantidadeTipo ? (material.quantidadeTotal - material.quantidadeDisponivel) : emUsoManutencao}
                </p>
                <p className="text-sm text-muted-foreground">{isQuantidadeTipo ? 'Em Uso' : 'Em Uso/Manutenção'}</p>
              </div>
            </div>

            <Separator />

            {material.descricao && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                  <p>{material.descricao}</p>
                </div>
                <Separator />
              </>
            )}
          </div>
        </TabsContent>

        {!isQuantidadeTipo && (
          <TabsContent value="seriais" className="mt-4">
          <div className="space-y-4">

            {/* Lista de Seriais */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Unidades (Seriais)</h3>
                <Button onClick={() => setShowNovoSerial(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Unidade
                </Button>
              </div>

              {loadingSeriais ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                  <p>Carregando unidades...</p>
                </div>
              ) : seriaisAtualizados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma unidade cadastrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seriaisAtualizados.map((serial) => (
                      <TableRow key={serial.numero}>
                        <TableCell className="font-mono text-sm">
                          {serial.numero}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              serial.status === 'disponivel' ? 'default' :
                              serial.status === 'em-uso' ? 'secondary' :
                              serial.status === 'perdido' ? 'destructive' :
                              'warning'
                            }
                          >
                            {statusConfig[serial.status]?.label || serial.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {serial.localizacao}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSerial(serial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSerial(serial.numero)}
                              disabled={serial.status === 'em-uso'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>
        )}

        <TabsContent value="historico" className="mt-4">
          <HistoricoMaterialTimeline materialId={material.id} />
        </TabsContent>
      </Tabs>
        </DialogContent>
      </Dialog>

      {!isQuantidadeTipo && (
        <NovoSerialDialog
          open={showNovoSerial}
          onOpenChange={setShowNovoSerial}
          materialId={material.id}
          materialNome={material.nome}
        />
      )}

      {isQuantidadeTipo && (
        <GerenciarQuantidadeDialog
          open={showGerenciarQuantidade}
          onOpenChange={setShowGerenciarQuantidade}
          materialId={material.id}
          materialNome={material.nome}
          quantidadeAtual={material.quantidadeTotal}
        />
      )}

      <EditarMaterialDialog
        open={showEditarMaterial}
        onOpenChange={setShowEditarMaterial}
        material={material}
      />

      {serialParaEditar && (
        <EditarSerialDialog
          open={showEditarSerial}
          onOpenChange={setShowEditarSerial}
          materialId={material.id}
          serial={serialParaEditar}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Excluir Unidade"
        description="Tem certeza que deseja excluir esta unidade do estoque? Esta ação não pode ser desfeita."
      />
    </>
  );
}
