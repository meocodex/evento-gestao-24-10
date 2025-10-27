import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEstoque } from '@/hooks/estoque';
import { Package, Search } from 'lucide-react';

interface AdicionarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: { itemId: string; nome: string; quantidade: number }) => void;
  itensJaNoChecklist?: string[];
}

export function AdicionarMaterialDialog({ 
  open, 
  onOpenChange, 
  onAdicionar,
  itensJaNoChecklist = [],
}: AdicionarMaterialDialogProps) {
  const { toast } = useToast();
  const { materiais } = useEstoque();
  const [materialId, setMaterialId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const materiaisFiltrados = materiais
    .filter(m => !itensJaNoChecklist.includes(m.id))
    .filter(m => 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const materialSelecionado = materiais.find(m => m.id === materialId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialId) {
      toast({
        title: 'Material obrigatório',
        description: 'Por favor, selecione um material do estoque.',
        variant: 'destructive',
      });
      return;
    }

    if (quantidade < 1) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    if (materialSelecionado && quantidade > materialSelecionado.quantidadeDisponivel) {
      toast({
        title: 'Quantidade indisponível',
        description: `Apenas ${materialSelecionado.quantidadeDisponivel} unidades disponíveis em estoque.`,
        variant: 'destructive',
      });
      return;
    }

    onAdicionar({ 
      itemId: materialSelecionado!.id, 
      nome: materialSelecionado!.nome, 
      quantidade 
    });
    
    // Reset form
    setMaterialId('');
    setQuantidade(1);
    setSearchTerm('');
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Material ao Checklist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar Material no Estoque</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nome ou categoria..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="border rounded-lg max-h-60 overflow-y-auto">
            {materiais.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum material cadastrado no estoque. Cadastre materiais na seção Estoque.
              </p>
            ) : materiaisFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm 
                  ? 'Nenhum material encontrado com esse termo.' 
                  : 'Todos os materiais já foram adicionados ao checklist.'}
              </p>
            ) : (
              <div className="divide-y">
                {materiaisFiltrados.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => setMaterialId(material.id)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                      materialId === material.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{material.nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{material.categoria}</p>
                        {material.descricao && (
                          <p className="text-xs text-muted-foreground mt-1">{material.descricao}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className={`text-sm font-medium ${
                          material.quantidadeDisponivel > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {material.quantidadeDisponivel} disponível
                        </span>
                        <p className="text-xs text-muted-foreground">de {material.quantidadeTotal} total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {materialSelecionado && (
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium">Material Selecionado:</p>
              <p className="text-sm">{materialSelecionado.nome}</p>
              <p className="text-xs text-muted-foreground">
                Disponível: {materialSelecionado.quantidadeDisponivel} {materialSelecionado.unidade}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input 
              id="quantidade"
              type="number"
              min="1"
              max={materialSelecionado?.quantidadeDisponivel || 999}
              value={quantidade} 
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} 
              required
              disabled={!materialId}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!materialId}>Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
