import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

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
