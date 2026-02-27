import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Plus, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBaseConhecimentoCategorias, useBaseConhecimentoArtigos } from '@/contexts/baseConhecimento/useBaseConhecimentoQueries';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { NovoArtigoSheet } from '@/components/baseConhecimento/NovoArtigoSheet';
import { GerenciarCategoriasSheet } from '@/components/baseConhecimento/GerenciarCategoriasSheet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BaseConhecimento() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission('admin.full_access');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>();
  const [novoArtigoOpen, setNovoArtigoOpen] = useState(false);
  const [gerenciarCategoriasOpen, setGerenciarCategoriasOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: categorias, isLoading: loadingCategorias } = useBaseConhecimentoCategorias();
  const { data: artigos, isLoading: loadingArtigos } = useBaseConhecimentoArtigos(categoriaFiltro, debouncedSearch);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Base de Conhecimento</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tutoriais, guias e informações para a equipe
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setGerenciarCategoriasOpen(true)}>
              <Settings2 className="h-4 w-4 mr-2" />
              Categorias
            </Button>
            <Button size="sm" onClick={() => setNovoArtigoOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Artigo
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!categoriaFiltro ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setCategoriaFiltro(undefined)}
        >
          Todas
        </Badge>
        {loadingCategorias ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))
        ) : (
          categorias?.map((cat) => (
            <Badge
              key={cat.id}
              variant={categoriaFiltro === cat.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategoriaFiltro(cat.id === categoriaFiltro ? undefined : cat.id)}
            >
              {cat.icone} {cat.nome} ({cat.total_artigos})
            </Badge>
          ))
        )}
      </div>

      {/* Artigos */}
      {loadingArtigos ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : artigos && artigos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artigos.map((artigo) => (
            <Card
              key={artigo.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/base-conhecimento/${artigo.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{artigo.titulo}</CardTitle>
                  {!artigo.publicado && (
                    <Badge variant="secondary" className="text-xs shrink-0">Rascunho</Badge>
                  )}
                </div>
                {artigo.categoria && (
                  <Badge variant="outline" className="w-fit text-xs">
                    {artigo.categoria.icone} {artigo.categoria.nome}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {artigo.resumo && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{artigo.resumo}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{artigo.autor_nome}</span>
                  <span>{format(new Date(artigo.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
                </div>
                {artigo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artigo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Nenhum artigo encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? 'Tente ajustar sua busca' : 'Ainda não há artigos publicados'}
          </p>
        </div>
      )}

      {/* Sheets */}
      <NovoArtigoSheet open={novoArtigoOpen} onOpenChange={setNovoArtigoOpen} />
      <GerenciarCategoriasSheet open={gerenciarCategoriasOpen} onOpenChange={setGerenciarCategoriasOpen} />
    </div>
  );
}
