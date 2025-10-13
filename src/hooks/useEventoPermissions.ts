import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

/**
 * Hook para verificar permissões de eventos baseado no role do usuário.
 * 
 * ⚠️ SEGURANÇA: Este hook é APENAS para controle de UI (mostrar/esconder botões e componentes).
 * A segurança REAL é garantida pelas políticas RLS (Row Level Security) no banco de dados.
 * 
 * NUNCA confie apenas em verificações client-side para segurança. Usuários maliciosos podem:
 * - Modificar o código JavaScript no navegador
 * - Chamar APIs diretamente ignorando a UI
 * - Manipular o localStorage/sessionStorage
 * 
 * As políticas RLS no Supabase são a ÚNICA fonte de verdade para autorização.
 * Este hook apenas melhora a experiência do usuário evitando que vejam ações que não podem executar.
 * 
 * @param evento - Evento opcional para verificar permissões específicas
 * @returns Objeto com flags booleanas indicando permissões de UI
 */
interface EventoPermissions {
  canEdit: boolean;
  canEditMaterials: boolean;
  canAllocate: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canCreateEvent: boolean;
  canDeleteEvent: boolean;
  canEditChecklist: boolean;
  canViewOperations: boolean;
  canEditOperations: boolean;
}

export function useEventoPermissions(evento?: Evento): EventoPermissions {
  const { user } = useAuth();

  if (!user) {
    return {
      canEdit: false,
      canEditMaterials: false,
      canAllocate: false,
      canViewFinancial: false,
      canEditFinancial: false,
      canCreateEvent: false,
      canDeleteEvent: false,
      canEditChecklist: false,
      canViewOperations: false,
      canEditOperations: false,
    };
  }

  const isAdmin = user.role === 'admin';
  const isComercial = user.role === 'comercial';
  const isSuporte = user.role === 'suporte';
  const isOwner = evento?.comercial.id === user.id;

  // IMPORTANTE: Estas flags controlam apenas a UI. A segurança real está nas políticas RLS do banco.
  return {
    // Comercial pode editar seus eventos, Admin pode editar todos
    canEdit: isAdmin || (isComercial && isOwner),
    
    // Apenas visualização de materiais
    canEditMaterials: false,
    
    // Suporte e Admin podem alocar materiais
    canAllocate: isAdmin || isSuporte,
    
    // Apenas Admin vê financeiro
    canViewFinancial: isAdmin,
    
    // Apenas Admin edita financeiro
    canEditFinancial: isAdmin,
    
    // Comercial e Admin podem criar eventos
    canCreateEvent: isAdmin || isComercial,
    
    // Apenas Admin pode deletar
    canDeleteEvent: isAdmin,
    
    // Comercial e Admin podem editar checklist
    canEditChecklist: isAdmin || (isComercial && isOwner),
    
    // Todos podem ver operações
    canViewOperations: true,
    
    // Suporte e Admin podem editar operações
    canEditOperations: isAdmin || isSuporte,
  };
}
