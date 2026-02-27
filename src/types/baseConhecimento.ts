export interface BaseConhecimentoCategoria {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  ordem: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface BaseConhecimentoArtigo {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string | null;
  categoria_id: string | null;
  tags: string[];
  anexos: ArtigoAnexo[];
  links_externos: ArtigoLink[];
  publicado: boolean;
  autor_id: string;
  autor_nome: string;
  visualizacoes: number;
  ordem: number;
  created_at: string;
  updated_at: string;
  // join
  categoria?: BaseConhecimentoCategoria | null;
}

export interface ArtigoAnexo {
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

export interface ArtigoLink {
  titulo: string;
  url: string;
  tipo: 'link' | 'youtube' | 'video';
}

export interface CategoriaComContagem extends BaseConhecimentoCategoria {
  total_artigos: number;
}
