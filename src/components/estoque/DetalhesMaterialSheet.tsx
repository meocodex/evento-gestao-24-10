import { DetailsSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MaterialEstoque, SerialEstoque, useEstoqueSeriais } from '@/hooks/estoque';
import { Package, MapPin, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { NovoSerialDialog } from './NovoSerialDialog';
import { EditarMaterialSheet } from './EditarMaterialSheet';
import { EditarSerialSheet } from './EditarSerialSheet';
import { HistoricoMaterialTimeline } from './HistoricoMaterialTimeline';
import { GerenciarQuantidadeDialog } from './GerenciarQuantidadeDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEstoque } from '@/hooks/estoque';
import { statusConfig } from '@/lib/estoqueStatus';

interface DetalhesMaterialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialEstoque;
}

export function DetalhesMaterialSheet({
  open, 
  onOpenChange, 
  material 
}: DetalhesMaterialSheetProps) {
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

  // Tab: Dados Gerais
  const DadosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {isQuantidadeTipo ? '🔢' : '📦'}
          {material.nome}
        </h3>
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
            Editar
          </Button>
        </div>
      </div>

      <Separator />

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

      {material.descricao && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Descrição</p>
            <p>{material.descricao}</p>
          </div>
        </>
      )}
    </div>
  );

  // Tab: Seriais
  const SeriaisTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
  );

  // Tab: Histórico
  const HistoricoTab = () => (
    <HistoricoMaterialTimeline materialId={material.id} />
  );

  const tabs = [
    {
      value: 'dados',
      label: 'Dados',
      content: <DadosTab />
    },
    ...(!isQuantidadeTipo ? [{
      value: 'seriais',
      label: 'Seriais',
      badge: totalAtualizado,
      content: <SeriaisTab />
    }] : []),
    {
      value: 'historico',
      label: 'Histórico',
      content: <HistoricoTab />
    }
  ];

  return (
    <>
      <DetailsSheet
        open={open}
        onOpenChange={onOpenChange}
        title={material.nome}
        tabs={tabs}
        size="xl"
      />

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

      <EditarMaterialSheet
        open={showEditarMaterial}
        onOpenChange={setShowEditarMaterial}
        material={material}
      />

      {serialParaEditar && (
        <EditarSerialSheet
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
