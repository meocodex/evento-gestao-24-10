import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

/**
 * Hook centralizado para verificação de permissões granulares.
 * 
 * ⚠️ SEGURANÇA: Este hook é APENAS para controle de UI (mostrar/esconder botões e componentes).
 * A segurança REAL é garantida pelas políticas RLS (Row Level Security) no banco de dados.
 * 
 * As políticas RLS no Supabase são a ÚNICA fonte de verdade para autorização.
 * Este hook apenas melhora a experiência do usuário evitando que vejam ações que não podem executar.
 * 
 * @example
 * // Verificar permissão única
 * const { hasPermission } = usePermissions();
 * if (hasPermission('eventos.criar')) {
 *   // Mostrar botão "Criar Evento"
 * }
 * 
 * @example
 * // Verificar múltiplas permissões (OR)
 * const { hasAnyPermission } = usePermissions();
 * if (hasAnyPermission(['financeiro.visualizar', 'financeiro.visualizar_proprios'])) {
 *   // Mostrar aba Financeiro
 * }
 * 
 * @example
 * // Verificar permissões específicas de evento
 * const { canEditEvent } = usePermissions();
 * if (canEditEvent(evento)) {
 *   // Mostrar botão "Editar"
 * }
 * 
 * @example
 * // Verificar todas as permissões (AND)
 * const { hasAllPermissions } = usePermissions();
 * if (hasAllPermissions(['eventos.criar', 'clientes.criar'])) {
 *   // Usuário tem ambas as permissões
 * }
 * 
 * @param evento - Evento opcional para verificações contextuais (próprios vs. todos)
 * @returns {UsePermissionsResult} Objeto com métodos de verificação e helpers
 */

/**
 * Resultado retornado pelo hook usePermissions
 */
export interface UsePermissionsResult {
  /** Verifica se o usuário possui uma permissão específica */
  hasPermission: (permissionId: string) => boolean;
  
  /** Verifica se o usuário possui PELO MENOS UMA das permissões (OR) */
  hasAnyPermission: (permissionIds: string[]) => boolean;
  
  /** Verifica se o usuário possui TODAS as permissões (AND) */
  hasAllPermissions: (permissionIds: string[]) => boolean;
  
  // === Helpers Específicos para Eventos ===
  
  /** Verifica se pode visualizar um evento (próprios ou todos) */
  canViewEvent: (evento?: Evento) => boolean;
  
  /** Verifica se pode editar um evento (próprios ou todos) */
  canEditEvent: (evento?: Evento) => boolean;
  
  /** Verifica se pode deletar eventos */
  canDeleteEvent: boolean;
  
  /** Verifica se pode criar novos eventos */
  canCreateEvent: boolean;
  
  // === Helpers Específicos para Financeiro ===
  
  /** Verifica se pode visualizar dados financeiros */
  canViewFinancial: boolean;
  
  /** Verifica se pode editar dados financeiros */
  canEditFinancial: boolean;
  
  // === Helpers Específicos para Operações ===
  
  /** Verifica se pode alocar materiais */
  canAllocateMaterials: boolean;
  
  /** Verifica se pode alocar materiais (alias) */
  canAllocate: boolean;
  
  /** Verifica se pode editar checklist de materiais */
  canEditChecklist: boolean;
  
  /** Verifica se pode editar operações */
  canEditOperations: boolean;
  
  // === Estado ===
  
  /** Lista de todas as permissões do usuário */
  permissions: string[];
  
  /** Indica se está carregando permissões */
  isLoading: boolean;
}

export function usePermissions(evento?: Evento): UsePermissionsResult {
  const { user, loading } = useAuth();
  
  // Admin tem acesso total (apenas UI - segurança real está no RLS)
  const isAdmin = user?.isAdmin === true;

  /**
   * Verifica se o usuário possui uma permissão específica
   * @param permissionId - ID da permissão (ex: 'eventos.criar')
   */
  const hasPermission = (permissionId: string): boolean => {
    if (isAdmin) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionId);
  };

  /**
   * Verifica se o usuário possui PELO MENOS UMA das permissões (OR)
   * @param permissionIds - Array de IDs de permissões
   */
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (isAdmin) return true;
    if (!user?.permissions) return false;
    return permissionIds.some(permissionId => user.permissions!.includes(permissionId));
  };

  /**
   * Verifica se o usuário possui TODAS as permissões (AND)
   * @param permissionIds - Array de IDs de permissões
   */
  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (isAdmin) return true;
    if (!user?.permissions) return false;
    return permissionIds.every(permissionId => user.permissions!.includes(permissionId));
  };

  /**
   * Verifica se pode visualizar um evento específico
   * Regras:
   * - eventos.visualizar_todos: pode ver todos os eventos
   * - eventos.visualizar_proprios: pode ver apenas seus próprios eventos
   * - eventos.visualizar: pode ver eventos básicos
   */
  const canViewEvent = (evento?: Evento): boolean => {
    if (isAdmin) return true;
    if (hasPermission('eventos.visualizar_todos')) return true;
    if (hasPermission('eventos.visualizar_proprios') && evento?.comercial?.id === user?.id) return true;
    return hasPermission('eventos.visualizar');
  };

  /**
   * Verifica se pode editar um evento específico
   * Regras:
   * - eventos.editar_todos: pode editar qualquer evento
   * - eventos.editar_proprios: pode editar apenas eventos onde é comercial
   */
  const canEditEvent = (evento?: Evento): boolean => {
    if (isAdmin) return true;
    if (hasPermission('eventos.editar_todos')) return true;
    if (hasPermission('eventos.editar_proprios') && evento?.comercial?.id === user?.id) return true;
    return false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Eventos
    canViewEvent,
    canEditEvent,
    canDeleteEvent: hasPermission('eventos.deletar'),
    canCreateEvent: hasPermission('eventos.criar'),
    
    // Financeiro
    canViewFinancial: hasAnyPermission(['financeiro.visualizar', 'financeiro.visualizar_proprios']),
    canEditFinancial: hasPermission('financeiro.editar'),
    
    // Operações
    canAllocateMaterials: hasPermission('estoque.alocar'),
    canAllocate: hasPermission('estoque.alocar'),
    canEditChecklist: hasAnyPermission(['eventos.editar_todos', 'eventos.editar_proprios', 'estoque.editar']),
    canEditOperations: hasAnyPermission(['equipe.editar', 'estoque.editar']),
    
    permissions: user?.permissions || [],
    isLoading: loading,
  };
}
