import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

/**
 * Hook centralizado para verificar permissões granulares do usuário.
 * 
 * ⚠️ SEGURANÇA: Este hook é APENAS para controle de UI (mostrar/esconder botões e componentes).
 * A segurança REAL é garantida pelas políticas RLS (Row Level Security) no banco de dados.
 * 
 * As políticas RLS no Supabase são a ÚNICA fonte de verdade para autorização.
 * Este hook apenas melhora a experiência do usuário evitando que vejam ações que não podem executar.
 */

interface UsePermissionsResult {
  // Verificador genérico
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  
  // Helpers específicos para eventos (compatibilidade com código antigo)
  canViewEvent: (evento?: Evento) => boolean;
  canEditEvent: (evento?: Evento) => boolean;
  canDeleteEvent: boolean;
  canCreateEvent: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canAllocateMaterials: boolean;
  canEditOperations: boolean;
  
  // Permissões carregadas
  permissions: string[];
  isLoading: boolean;
}

export function usePermissions(evento?: Evento): UsePermissionsResult {
  const { user, loading } = useAuth();

  const hasPermission = (permissionId: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionId);
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissionIds.some(permissionId => user.permissions!.includes(permissionId));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissionIds.every(permissionId => user.permissions!.includes(permissionId));
  };

  // Helpers para eventos (compatibilidade com código antigo)
  const canViewEvent = (evento?: Evento): boolean => {
    if (hasPermission('eventos.visualizar_todos')) return true;
    if (hasPermission('eventos.visualizar_proprios') && evento?.comercial?.id === user?.id) return true;
    return hasPermission('eventos.visualizar');
  };

  const canEditEvent = (evento?: Evento): boolean => {
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
    canEditOperations: hasAnyPermission(['equipe.editar', 'estoque.editar']),
    
    permissions: user?.permissions || [],
    isLoading: loading,
  };
}
