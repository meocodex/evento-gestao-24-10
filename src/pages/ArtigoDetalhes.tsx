import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, User, Tag, ExternalLink, FileDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useBaseConhecimentoArtigo } from '@/contexts/baseConhecimento/useBaseConhecimentoQueries';
import { useExcluirArtigo } from '@/contexts/baseConhecimento/useBaseConhecimentoMutations';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { EditarArtigoSheet } from '@/components/baseConhecimento/EditarArtigoSheet';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { ArtigoAnexo, ArtigoLink } from '@/types/baseConhecimento';

export default function ArtigoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission('admin.full_access');

  const { data: artigo, isLoading } = useBaseConhecimentoArtigo(id || '');
  const excluirArtigo = useExcluirArtigo();

  const [editarOpen, setEditarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    await excluirArtigo.mutateAsync(id);
    navigate('/base-conhecimento');
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-muted-foreground">Artigo não encontrado</p>
        <Button variant="link" onClick={() => navigate('/base-conhecimento')}>
          Voltar
        </Button>
      </div>
    );
  }

  const anexos = (artigo.anexos || []) as ArtigoAnexo[];
  const links = (artigo.links_externos || []) as ArtigoLink[];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/base-conhecimento')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditarOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Title & Meta */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {artigo.categoria && (
            <Badge variant="outline">
              {artigo.categoria.icone} {artigo.categoria.nome}
            </Badge>
          )}
          {!artigo.publicado && <Badge variant="secondary">Rascunho</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{artigo.titulo}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{artigo.autor_nome}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(artigo.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{artigo.visualizacoes} visualizações</span>
        </div>
        {artigo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {artigo.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Content */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
      />

      {/* Links & Videos */}
      {links.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Links e Vídeos</h2>
            <div className="space-y-4">
              {links.map((link, i) => {
                const embedUrl = link.tipo === 'youtube' ? getYoutubeEmbedUrl(link.url) : null;
                if (embedUrl) {
                  return (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-medium">{link.titulo}</p>
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <iframe
                          src={embedUrl}
                          title={link.titulo}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link.titulo || link.url}
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Anexos */}
      {anexos.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Anexos</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {anexos.map((anexo, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{anexo.nome}</p>
                      <p className="text-xs text-muted-foreground">{anexo.tipo}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sheets */}
      {isAdmin && artigo && (
        <EditarArtigoSheet open={editarOpen} onOpenChange={setEditarOpen} artigo={artigo} />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir artigo"
        description="Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
