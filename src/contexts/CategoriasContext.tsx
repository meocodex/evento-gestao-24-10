import { createContext, useContext, ReactNode } from 'react';
import { useCategoriasQueries } from './categorias/useCategoriasQueries';
import { useCategoriasMutations } from './categorias/useCategoriasMutations';
import { TipoCategoria, Categoria } from '@/types/categorias';

interface CategoriasContextData {
  categoriasDemandas: Categoria[];
  categoriasEstoque: Categoria[];
  categoriasDespesas: Categoria[];
  funcoesEquipe: Categoria[];
  isLoading: boolean;
  
  getCategorias: (tipo: TipoCategoria) => Categoria[];
  getCategoriasAtivas: (tipo: TipoCategoria) => Categoria[];
  atualizarCategorias: (tipo: TipoCategoria, categorias: Categoria[]) => Promise<void>;
  adicionarCategoria: (tipo: TipoCategoria, categoria: Categoria) => Promise<void>;
  toggleCategoria: (tipo: TipoCategoria, value: string) => Promise<void>;
  editarCategoria: (tipo: TipoCategoria, value: string, novoLabel: string) => Promise<void>;
  excluirCategoria: (tipo: TipoCategoria, value: string) => Promise<void>;
}

const CategoriasContext = createContext<CategoriasContextData>({} as CategoriasContextData);

export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias must be used within CategoriasProvider');
  }
  return context;
};

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const queries = useCategoriasQueries();
  const mutations = useCategoriasMutations();

  const atualizarCategorias = async (tipo: TipoCategoria, categorias: Categoria[]) => {
    await mutations.atualizarCategorias.mutateAsync({ tipo, categorias });
  };

  const adicionarCategoria = async (tipo: TipoCategoria, categoria: Categoria) => {
    await mutations.adicionarCategoria.mutateAsync({ tipo, categoria });
  };

  const toggleCategoria = async (tipo: TipoCategoria, value: string) => {
    await mutations.toggleCategoria.mutateAsync({ tipo, value });
  };

  const editarCategoria = async (tipo: TipoCategoria, value: string, novoLabel: string) => {
    await mutations.editarCategoria.mutateAsync({ tipo, value, novoLabel });
  };

  const excluirCategoria = async (tipo: TipoCategoria, value: string) => {
    await mutations.excluirCategoria.mutateAsync({ tipo, value });
  };

  return (
    <CategoriasContext.Provider
      value={{
        ...queries,
        atualizarCategorias,
        adicionarCategoria,
        toggleCategoria,
        editarCategoria,
        excluirCategoria,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
}
