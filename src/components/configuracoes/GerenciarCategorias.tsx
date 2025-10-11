import { useState } from 'react';
import { Plus, Edit2, Power, GripVertical } from 'lucide-react';
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
  const { getCategorias, adicionarCategoria, toggleCategoria } = useCategorias();
  const categorias = getCategorias(tipo);
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoLabel, setNovoLabel] = useState('');
  const [novoValue, setNovoValue] = useState('');

  const handleAdicionar = async () => {
    if (!novoLabel.trim() || !novoValue.trim()) return;

    const novaCategoria: Categoria = {
      value: novoValue.toLowerCase().replace(/\s+/g, '_'),
      label: novoLabel,
      ativa: true,
    };

    await adicionarCategoria(tipo, novaCategoria);
    setNovoLabel('');
    setNovoValue('');
    setDialogAberto(false);
  };

  const handleToggle = async (value: string) => {
    await toggleCategoria(tipo, value);
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
                    onClick={() => handleToggle(cat.value)}
                    className={cat.ativa ? 'text-green-500' : 'text-muted-foreground'}
                  >
                    <Power className="w-4 h-4" />
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
              <Button onClick={handleAdicionar} disabled={!novoLabel.trim() || !novoValue.trim()}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
