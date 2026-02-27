import { useState } from 'react';
import { BaseSheet } from '@/components/shared/sheets/BaseSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import {
  useCriarCategoria,
  useAtualizarCategoria,
  useExcluirCategoria,
} from '@/contexts/baseConhecimento/useBaseConhecimentoMutations';
import { useTodasCategorias } from '@/contexts/baseConhecimento/useBaseConhecimentoQueries';
import type { BaseConhecimentoCategoria } from '@/types/baseConhecimento';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerenciarCategoriasSheet({ open, onOpenChange }: Props) {
  const { data: categorias, isLoading } = useTodasCategorias();
  const criarCategoria = useCriarCategoria();
  const atualizarCategoria = useAtualizarCategoria();
  const excluirCategoria = useExcluirCategoria();

  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '', icone: '' });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', descricao: '', icone: '' });

  const handleCriar = async () => {
    if (!novaCategoria.nome.trim()) return;
    await criarCategoria.mutateAsync({
      nome: novaCategoria.nome,
      descricao: novaCategoria.descricao || undefined,
      icone: novaCategoria.icone || undefined,
      ordem: (categorias?.length || 0),
    });
    setNovaCategoria({ nome: '', descricao: '', icone: '' });
  };

  const startEdit = (cat: BaseConhecimentoCategoria) => {
    setEditandoId(cat.id);
    setEditForm({ nome: cat.nome, descricao: cat.descricao || '', icone: cat.icone || '' });
  };

  const handleSaveEdit = async () => {
    if (!editandoId) return;
    await atualizarCategoria.mutateAsync({
      id: editandoId,
      nome: editForm.nome,
      descricao: editForm.descricao || undefined,
      icone: editForm.icone || undefined,
    });
    setEditandoId(null);
  };

  return (
    <BaseSheet open={open} onOpenChange={onOpenChange} title="Gerenciar Categorias" size="lg">
      <ScrollArea className="flex-1 px-1">
        <div className="space-y-6 pb-4">
          {/* Nova Categoria */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <Label className="text-sm font-semibold">Nova Categoria</Label>
            <div className="grid grid-cols-[60px_1fr] gap-2">
              <Input
                placeholder="🔖"
                value={novaCategoria.icone}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, icone: e.target.value })}
                className="text-center"
              />
              <Input
                placeholder="Nome da categoria"
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
              />
            </div>
            <Input
              placeholder="Descrição (opcional)"
              value={novaCategoria.descricao}
              onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
            />
            <Button size="sm" onClick={handleCriar} disabled={criarCategoria.isPending || !novaCategoria.nome.trim()}>
              <Plus className="h-4 w-4 mr-1" />Adicionar
            </Button>
          </div>

          {/* Lista de Categorias */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              categorias?.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {editandoId === cat.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <Input
                          value={editForm.icone}
                          onChange={(e) => setEditForm({ ...editForm, icone: e.target.value })}
                          className="text-center"
                        />
                        <Input
                          value={editForm.nome}
                          onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={atualizarCategoria.isPending}>
                          <Save className="h-3.5 w-3.5 mr-1" />Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
                          <X className="h-3.5 w-3.5 mr-1" />Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg">{cat.icone || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cat.nome}</p>
                        {cat.descricao && <p className="text-xs text-muted-foreground truncate">{cat.descricao}</p>}
                      </div>
                      <Switch
                        checked={cat.ativa}
                        onCheckedChange={(v) => atualizarCategoria.mutate({ id: cat.id, ativa: v })}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => excluirCategoria.mutate(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </BaseSheet>
  );
}
