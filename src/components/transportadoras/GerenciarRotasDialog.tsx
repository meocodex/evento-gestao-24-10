import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Transportadora, RotaAtendida } from '@/types/transportadoras';
import { useTransportadoras } from '@/contexts/TransportadorasContext';

interface GerenciarRotasDialogProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerenciarRotasDialog({ transportadora, open, onOpenChange }: GerenciarRotasDialogProps) {
  const { adicionarRota, editarRota, removerRota } = useTransportadoras();
  const [editandoRota, setEditandoRota] = useState<RotaAtendida | null>(null);
  const [novaRota, setNovaRota] = useState<Omit<RotaAtendida, 'id'>>({
    cidadeDestino: '',
    estadoDestino: '',
    prazoEntrega: 1,
    valorBase: 0,
    ativa: true,
  });

  const handleAdicionarRota = () => {
    if (!novaRota.cidadeDestino || !novaRota.estadoDestino) return;

    adicionarRota(transportadora.id, novaRota);
    setNovaRota({
      cidadeDestino: '',
      estadoDestino: '',
      prazoEntrega: 1,
      valorBase: 0,
      ativa: true,
    });
  };

  const handleEditarRota = (rota: RotaAtendida) => {
    if (!editandoRota) return;
    editarRota(transportadora.id, rota.id, editandoRota);
    setEditandoRota(null);
  };

  const handleRemoverRota = (rotaId: string) => {
    if (confirm('Deseja realmente remover esta rota?')) {
      removerRota(transportadora.id, rotaId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Rotas - {transportadora.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar Nova Rota */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Rota
            </h3>
            <div className="grid grid-cols-5 gap-3">
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={novaRota.cidadeDestino}
                  onChange={(e) => setNovaRota({ ...novaRota, cidadeDestino: e.target.value })}
                  placeholder="Ex: Rio de Janeiro"
                />
              </div>
              <div>
                <Label>Estado *</Label>
                <Input
                  value={novaRota.estadoDestino}
                  onChange={(e) => setNovaRota({ ...novaRota, estadoDestino: e.target.value.toUpperCase() })}
                  placeholder="Ex: RJ"
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Prazo (dias)</Label>
                <Input
                  type="number"
                  value={novaRota.prazoEntrega}
                  onChange={(e) => setNovaRota({ ...novaRota, prazoEntrega: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
              <div>
                <Label>Valor Base (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaRota.valorBase}
                  onChange={(e) => setNovaRota({ ...novaRota, valorBase: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAdicionarRota} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Rotas */}
          <div>
            <h3 className="font-semibold mb-3">Rotas Cadastradas ({transportadora.rotasAtendidas.length})</h3>
            {transportadora.rotasAtendidas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma rota cadastrada ainda</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destino</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Valor Base</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transportadora.rotasAtendidas.map((rota) => (
                    <TableRow key={rota.id}>
                      <TableCell>
                        {editandoRota?.id === rota.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editandoRota.cidadeDestino}
                              onChange={(e) => setEditandoRota({ ...editandoRota, cidadeDestino: e.target.value })}
                              className="w-32"
                            />
                            <Input
                              value={editandoRota.estadoDestino}
                              onChange={(e) => setEditandoRota({ ...editandoRota, estadoDestino: e.target.value.toUpperCase() })}
                              className="w-16"
                              maxLength={2}
                            />
                          </div>
                        ) : (
                          <span className="font-medium">
                            {rota.cidadeDestino} - {rota.estadoDestino}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoRota?.id === rota.id ? (
                          <Input
                            type="number"
                            value={editandoRota.prazoEntrega}
                            onChange={(e) => setEditandoRota({ ...editandoRota, prazoEntrega: parseInt(e.target.value) })}
                            className="w-20"
                          />
                        ) : (
                          `${rota.prazoEntrega} ${rota.prazoEntrega === 1 ? 'dia' : 'dias'}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoRota?.id === rota.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editandoRota.valorBase}
                            onChange={(e) => setEditandoRota({ ...editandoRota, valorBase: parseFloat(e.target.value) })}
                            className="w-24"
                          />
                        ) : (
                          rota.valorBase ? `R$ ${rota.valorBase.toFixed(2)}` : '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editandoRota?.id === rota.id ? (
                          <Switch
                            checked={editandoRota.ativa}
                            onCheckedChange={(checked) => setEditandoRota({ ...editandoRota, ativa: checked })}
                          />
                        ) : (
                          <Badge variant={rota.ativa ? 'default' : 'secondary'}>
                            {rota.ativa ? 'Ativa' : 'Inativa'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {editandoRota?.id === rota.id ? (
                            <>
                              <Button size="sm" onClick={() => handleEditarRota(rota)}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditandoRota(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditandoRota(rota)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoverRota(rota.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
