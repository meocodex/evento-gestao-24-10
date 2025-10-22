import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

/**
 * @deprecated Este hook foi substituído por usePermissions.
 * 
 * ⚠️ **NÃO USE ESTE HOOK EM CÓDIGO NOVO!**
 * 
 * ## Motivo da Deprecação
 * 
 * Este hook usa lógica hardcoded baseada em roles fixas (`admin`, `comercial`, `suporte`).
 * O sistema migrou para **permissões granulares** que permitem controle fino sobre cada ação.
 * 
 * ## Problemas com este Hook
 * 
 * 1. ❌ Usa roles fixas ao invés de permissões granulares
 * 2. ❌ Não reflete as permissões reais configuradas no banco
 * 3. ❌ Impossível criar perfis customizados
 * 4. ❌ Lógica duplicada (roles no banco + lógica hardcoded aqui)
 * 
 * ## Como Migrar
 * 
 * ### Antes (❌ Deprecado):
 * ```typescript
 * import { useEventoPermissions } from '@/hooks/useEventoPermissions';
 * 
 * function EventoCard({ evento }) {
 *   const { canEdit } = useEventoPermissions(evento);
 *   return canEdit && <Button>Editar</Button>;
 * }
 * ```
 * 
 * ### Depois (✅ Novo):
 * ```typescript
 * import { usePermissions } from '@/hooks/usePermissions';
 * 
 * function EventoCard({ evento }) {
 *   const { canEditEvent } = usePermissions();
 *   return canEditEvent(evento) && <Button>Editar</Button>;
 * }
 * ```
 * 
 * ## Mapeamento de Métodos
 * 
 * | Antigo                 | Novo                                    | Nota                    |
 * |------------------------|-----------------------------------------|-------------------------|
 * | `canEdit`              | `canEditEvent(evento)`                  | Agora é função          |
 * | `canViewFinancial`     | `canViewFinancial`                      | Mantido igual           |
 * | `canEditFinancial`     | `canEditFinancial`                      | Mantido igual           |
 * | `canCreateEvent`       | `canCreateEvent`                        | Mantido igual           |
 * | `canDeleteEvent`       | `canDeleteEvent`                        | Mantido igual           |
 * | `canAllocate`          | `canAllocateMaterials`                  | Nome mais descritivo    |
 * | `canEditOperations`    | `canEditOperations`                     | Mantido igual           |
 * | `canEditMaterials`     | N/A (removido)                          | Use canAllocateMaterials|
 * | `canEditChecklist`     | `canEditEvent(evento)`                  | Usa mesma permissão     |
 * | `canViewOperations`    | Sempre true                             | Removido                |
 * 
 * ## Documentação Completa
 * 
 * Para guia completo de migração, veja: `docs/PERMISSIONS_MIGRATION.md`
 * 
 * @see src/hooks/usePermissions.ts - Hook novo recomendado
 * @see docs/PERMISSIONS_MIGRATION.md - Guia completo de migração
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

  // ⚠️ Aviso de deprecação no console (apenas em development)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ DEPRECATION WARNING: useEventoPermissions está deprecado.\n' +
      '   Use usePermissions do arquivo @/hooks/usePermissions.\n' +
      '   Veja docs/PERMISSIONS_MIGRATION.md para guia de migração.'
    );
  }

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

  // ⚠️ LÓGICA ANTIGA - Baseada em roles fixas
  // Este código será removido em versão futura
  const isAdmin = user.role === 'admin';
  const isComercial = user.role === 'comercial';
  const isSuporte = user.role === 'suporte';
  const isOwner = evento?.comercial?.id === user.id;

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
