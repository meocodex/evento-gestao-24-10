import { useState } from 'react';
import { Plus, Edit2, Power, GripVertical, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategorias } from '@/contexts/CategoriasContext';
import { TipoCategoria, Categoria } from '@/types/categorias';

interface GerenciarCategoriasProps {
  tipo: TipoCategoria;
  titulo: string;
  descricao: string;
}

export function GerenciarCategorias({ tipo, titulo, descricao }: GerenciarCategoriasProps) {
  const { getCategorias, adicionarCategoria, toggleCategoria, editarCategoria, excluirCategoria } = useCategorias();
  const categorias = getCategorias(tipo);
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [confirmExcluirAberto, setConfirmExcluirAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState<Categoria | null>(null);
  const [novoLabel, setNovoLabel] = useState('');
  const [novoValue, setNovoValue] = useState('');
  const [labelEditando, setLabelEditando] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdicionar = async () => {
    if (!novoLabel.trim() || !novoValue.trim() || loading) return;

    setLoading(true);
    try {
      const novaCategoria: Categoria = {
        value: novoValue.toLowerCase().replace(/\s+/g, '_'),
        label: novoLabel,
        ativa: true,
      };

      console.log(`[${tipo}] Adicionando categoria:`, novaCategoria);
      await adicionarCategoria(tipo, novaCategoria);
      console.log(`[${tipo}] Categoria adicionada com sucesso`);
      
      setNovoLabel('');
      setNovoValue('');
      setDialogAberto(false);
    } catch (error) {
      console.error(`[${tipo}] Erro ao adicionar categoria:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: string) => {
    await toggleCategoria(tipo, value);
  };

  const handleEditar = async () => {
    if (!categoriaEditando || !labelEditando.trim()) return;
    await editarCategoria(tipo, categoriaEditando.value, labelEditando);
    setDialogEditarAberto(false);
    setCategoriaEditando(null);
    setLabelEditando('');
  };

  const handleExcluir = async () => {
    if (!categoriaExcluindo) return;
    await excluirCategoria(tipo, categoriaExcluindo.value);
    setConfirmExcluirAberto(false);
    setCategoriaExcluindo(null);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-display">{titulo}</CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setDialogAberto(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Categoria
        </Button>

        <div className="space-y-2">
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma categoria configurada
            </p>
          ) : (
            categorias.map((cat) => (
              <div
                key={cat.value}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.label}</span>
                      {!cat.ativa && (
                        <Badge variant="outline" className="text-xs">
                          Inativa
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{cat.value}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCategoriaEditando(cat);
                      setLabelEditando(cat.label);
                      setDialogEditarAberto(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(cat.value)}
                    className={cat.ativa ? 'text-green-500' : 'text-muted-foreground'}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCategoriaExcluindo(cat);
                      setConfirmExcluirAberto(true);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para {titulo.toLowerCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Nome da Categoria</Label>
                <Input
                  id="label"
                  value={novoLabel}
                  onChange={(e) => {
                    setNovoLabel(e.target.value);
                    setNovoValue(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                  }}
                  placeholder="Ex: Técnica"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Identificador (gerado automaticamente)</Label>
                <Input
                  id="value"
                  value={novoValue}
                  onChange={(e) => setNovoValue(e.target.value)}
                  placeholder="tecnica"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionar} disabled={!novoLabel.trim() || !novoValue.trim() || loading}>
                {loading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Altere o nome da categoria
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-label">Nome da Categoria</Label>
                <Input
                  id="edit-label"
                  value={labelEditando}
                  onChange={(e) => setLabelEditando(e.target.value)}
                  placeholder="Ex: Técnica"
                />
              </div>
              <div className="space-y-2">
                <Label>Identificador</Label>
                <Input value={categoriaEditando?.value || ''} disabled />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogEditarAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditar} disabled={!labelEditando.trim()}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmExcluirAberto}
          onOpenChange={setConfirmExcluirAberto}
          onConfirm={handleExcluir}
          title="Excluir Categoria"
          description={`Tem certeza que deseja excluir a categoria "${categoriaExcluindo?.label}"? Esta ação não pode ser desfeita.`}
          variant="danger"
          confirmText="Excluir"
        />
      </CardContent>
    </Card>
  );
}
