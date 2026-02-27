import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseSheet } from '@/components/shared/sheets/BaseSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Json } from '@/integrations/supabase/types';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { useCriarArtigo } from '@/contexts/baseConhecimento/useBaseConhecimentoMutations';
import { useTodasCategorias } from '@/contexts/baseConhecimento/useBaseConhecimentoQueries';
import { useAuth } from '@/hooks/useAuth';
import { TagInput } from '@/components/estoque/TagInput';
import type { ArtigoLink } from '@/types/baseConhecimento';

const schema = z.object({
  titulo: z.string().min(3, 'Título obrigatório (mín. 3 caracteres)'),
  conteudo: z.string().min(1, 'Conteúdo obrigatório'),
  resumo: z.string().optional(),
  categoria_id: z.string().optional(),
  publicado: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoArtigoSheet({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const criarArtigo = useCriarArtigo();
  const { data: categorias } = useTodasCategorias();
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<ArtigoLink[]>([]);
  const [novoLink, setNovoLink] = useState({ titulo: '', url: '', tipo: 'link' as const });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { titulo: '', conteudo: '', resumo: '', categoria_id: '', publicado: false },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    await criarArtigo.mutateAsync({
      titulo: values.titulo,
      conteudo: values.conteudo,
      resumo: values.resumo,
      categoria_id: values.categoria_id || undefined,
      publicado: values.publicado,
      tags,
      links_externos: links as unknown as Json,
      anexos: [],
      autor_id: user.id,
      autor_nome: user.name || 'Admin',
    });
    reset();
    setTags([]);
    setLinks([]);
    onOpenChange(false);
  };

  const addLink = () => {
    if (!novoLink.url) return;
    const tipo = novoLink.url.includes('youtube.com') || novoLink.url.includes('youtu.be') ? 'youtube' : 'link';
    setLinks([...links, { ...novoLink, tipo }]);
    setNovoLink({ titulo: '', url: '', tipo: 'link' });
  };

  return (
    <BaseSheet open={open} onOpenChange={onOpenChange} title="Novo Artigo" size="xl">
      <ScrollArea className="flex-1 px-1">
        <form id="novo-artigo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input {...register('titulo')} placeholder="Título do artigo" />
            {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Resumo</Label>
            <Input {...register('resumo')} placeholder="Breve descrição do artigo" />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select onValueChange={(v) => setValue('categoria_id', v)} value={watch('categoria_id')}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {categorias?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icone} {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} placeholder="Adicionar tag..." />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo *</Label>
            <Textarea
              {...register('conteudo')}
              placeholder="Escreva o conteúdo do artigo aqui... (suporta HTML)"
              className="min-h-[200px] font-mono text-sm"
            />
            {errors.conteudo && <p className="text-xs text-destructive">{errors.conteudo.message}</p>}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <Label>Links e Vídeos</Label>
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{link.titulo || link.url}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLinks(links.filter((_, idx) => idx !== i))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Título"
                value={novoLink.titulo}
                onChange={(e) => setNovoLink({ ...novoLink, titulo: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="URL"
                value={novoLink.url}
                onChange={(e) => setNovoLink({ ...novoLink, url: e.target.value })}
                className="flex-[2]"
              />
              <Button type="button" variant="outline" size="icon" onClick={addLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={watch('publicado')}
              onCheckedChange={(v) => setValue('publicado', v)}
            />
            <Label>Publicar imediatamente</Label>
          </div>
        </form>
      </ScrollArea>

      <div className="border-t pt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button type="submit" form="novo-artigo-form" disabled={criarArtigo.isPending}>
          {criarArtigo.isPending ? 'Salvando...' : 'Salvar Artigo'}
        </Button>
      </div>
    </BaseSheet>
  );
}
