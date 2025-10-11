export interface Categoria {
  value: string;
  label: string;
  ativa: boolean;
}

export type TipoCategoria = 'demandas' | 'estoque' | 'despesas' | 'funcoes_equipe';

export interface ConfiguracaoCategoria {
  id: string;
  user_id: string;
  tipo: TipoCategoria;
  categorias: Categoria[];
  created_at: string;
  updated_at: string;
}
