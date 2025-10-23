/**
 * Helper temporário para facilitar migração
 * TODO: Remover após migração completa  
 */
import { useCategoriasQueries } from './index';

export function useCategorias() {
  const queries = useCategoriasQueries();
  
  return queries;
}
