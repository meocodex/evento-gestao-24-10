import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTransportadoras } from '@/hooks/transportadoras';
import { Transportadora, RotaAtendida } from '@/types/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface GerenciarRotasSheetProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerenciarRotasSheet({ transportadora, open, onOpenChange }: GerenciarRotasSheetProps) {
  const { adicionarRota, editarRota, removerRota } = useTransportadoras();
  const isMobile = useIsMobile();
  
  const [novaRota, setNovaRota] = useState({
    cidadeDestino: '',
    estadoDestino: '',
    prazoEntrega: 0,
    valorBase: 0,
    ativa: true,
  });

  const [editandoRota, setEditandoRota] = useState<RotaAtendida | null>(null);

  const handleAdicionarRota = async () => {
    if (!novaRota.cidadeDestino || !novaRota.estadoDestino || novaRota.prazoEntrega <= 0) {
      return;
    }

    await adicionarRota.mutateAsync({ transportadoraId: transportadora.id, rota: novaRota });
    setNovaRota({
      cidadeDestino: '',
      estadoDestino: '',
      prazoEntrega: 0,
      valorBase: 0,
      ativa: true,
    });
  };

  const handleEditarRota = async () => {
    if (!editandoRota) return;
    
    const rotaIndex = transportadora.rotasAtendidas?.findIndex(r => r.id === editandoRota.id) ?? -1;
    if (rotaIndex !== -1) {
      await editarRota.mutateAsync({
        transportadoraId: transportadora.id,
        rotaIndex,
        rota: editandoRota,
      });
    }
    setEditandoRota(null);
  };

  const handleRemoverRota = async (rotaId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta rota?')) {
      const rotaIndex = transportadora.rotasAtendidas?.findIndex(r => r.id === rotaId) ?? -1;
      if (rotaIndex !== -1) {
        await removerRota.mutateAsync({ transportadoraId: transportadora.id, rotaIndex });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[700px] lg:w-[900px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Gerenciar Rotas
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            {transportadora.nome} - Configure as rotas atendidas
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Formulário para adicionar nova rota */}
          <div className="bg-navy-50 border border-navy-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">
              {editandoRota ? 'Editar Rota' : 'Nova Rota'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade" className="text-navy-700">Cidade Destino *</Label>
                <Input
                  id="cidade"
                  value={editandoRota ? editandoRota.cidadeDestino : novaRota.cidadeDestino}
                  onChange={(e) =>
                    editandoRota
                      ? setEditandoRota({ ...editandoRota, cidadeDestino: e.target.value })
                      : setNovaRota({ ...novaRota, cidadeDestino: e.target.value })
                  }
                  className="border-navy-200"
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="estado" className="text-navy-700">Estado *</Label>
                <Input
                  id="estado"
                  value={editandoRota ? editandoRota.estadoDestino : novaRota.estadoDestino}
                  onChange={(e) =>
                    editandoRota
                      ? setEditandoRota({ ...editandoRota, estadoDestino: e.target.value })
                      : setNovaRota({ ...novaRota, estadoDestino: e.target.value })
                  }
                  className="border-navy-200"
                  placeholder="Ex: SP"
                />
              </div>
              <div>
                <Label htmlFor="prazo" className="text-navy-700">Prazo de Entrega (dias) *</Label>
                <Input
                  id="prazo"
                  type="number"
                  min="1"
                  value={editandoRota ? editandoRota.prazoEntrega : novaRota.prazoEntrega}
                  onChange={(e) =>
                    editandoRota
                      ? setEditandoRota({ ...editandoRota, prazoEntrega: parseInt(e.target.value) })
                      : setNovaRota({ ...novaRota, prazoEntrega: parseInt(e.target.value) })
                  }
                  className="border-navy-200"
                />
              </div>
              <div>
                <Label htmlFor="valor" className="text-navy-700">Valor Base (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editandoRota ? editandoRota.valorBase || 0 : novaRota.valorBase}
                  onChange={(e) =>
                    editandoRota
                      ? setEditandoRota({ ...editandoRota, valorBase: parseFloat(e.target.value) })
                      : setNovaRota({ ...novaRota, valorBase: parseFloat(e.target.value) })
                  }
                  className="border-navy-200"
                />
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <Switch
                  id="ativa"
                  checked={editandoRota ? editandoRota.ativa : novaRota.ativa}
                  onCheckedChange={(checked) =>
                    editandoRota
                      ? setEditandoRota({ ...editandoRota, ativa: checked })
                      : setNovaRota({ ...novaRota, ativa: checked })
                  }
                />
                <Label htmlFor="ativa" className="text-navy-700">Rota Ativa</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {editandoRota ? (
                <>
                  <Button onClick={handleEditarRota}>
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => setEditandoRota(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={handleAdicionarRota}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Rota
                </Button>
              )}
            </div>
          </div>

          {/* Tabela de rotas */}
          <div className="border border-navy-100 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50">
                  <TableHead className="text-navy-800">Destino</TableHead>
                  <TableHead className="text-navy-800">Prazo</TableHead>
                  <TableHead className="text-navy-800">Valor Base</TableHead>
                  <TableHead className="text-navy-800">Status</TableHead>
                  <TableHead className="text-navy-800 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transportadora.rotasAtendidas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-navy-500 py-8">
                      Nenhuma rota cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transportadora.rotasAtendidas.map((rota) => (
                    <TableRow key={rota.id} className="hover:bg-navy-50">
                      <TableCell className="text-navy-900">
                        {rota.cidadeDestino} - {rota.estadoDestino}
                      </TableCell>
                      <TableCell className="text-navy-700">
                        {rota.prazoEntrega} {rota.prazoEntrega === 1 ? 'dia' : 'dias'}
                      </TableCell>
                      <TableCell className="text-navy-700">
                        {rota.valorBase ? `R$ ${rota.valorBase.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rota.ativa ? 'default' : 'secondary'}>
                          {rota.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditandoRota(rota)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverRota(rota.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
