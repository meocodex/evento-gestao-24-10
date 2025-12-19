import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type TableName = 
  | 'eventos' 
  | 'demandas' 
  | 'demandas_comentarios' 
  | 'demandas_anexos'
  | 'clientes'
  | 'materiais_estoque'
  | 'materiais_seriais'
  | 'eventos_materiais_alocados'
  | 'eventos_despesas'
  | 'eventos_receitas'
  | 'eventos_equipe'
  | 'eventos_checklist'
  | 'eventos_timeline'
  | 'equipe_operacional'
  | 'contas_pagar'
  | 'contas_receber'
  | 'contratos'
  | 'contratos_templates'
  | 'envios'
  | 'transportadoras'
  | 'transportadoras_rotas'
  | 'user_permissions'
  | 'profiles';

// Mapeamento de tabelas para query keys que precisam ser invalidadas
const TABLE_QUERY_MAP: Record<TableName, string[][]> = {
  // Eventos e relacionados
  eventos: [['eventos'], ['dashboard-stats'], ['evento-detalhes']],
  eventos_materiais_alocados: [['evento-detalhes'], ['eventos-materiais-alocados'], ['eventos-checklist'], ['materiais_estoque'], ['dashboard-stats']],
  eventos_despesas: [['evento-detalhes'], ['eventos-despesas']],
  eventos_receitas: [['evento-detalhes'], ['eventos-receitas']],
  eventos_equipe: [['evento-detalhes'], ['eventos-equipe']],
  eventos_checklist: [['evento-detalhes'], ['eventos-checklist']],
  eventos_timeline: [['evento-detalhes']],
  
  // Demandas
  demandas: [['demandas'], ['dashboard-stats'], ['demandas-reembolso']],
  demandas_comentarios: [['demandas'], ['demanda-detalhes']],
  demandas_anexos: [['demandas'], ['demanda-detalhes']],
  
  // Clientes
  clientes: [['clientes']],
  
  // Estoque
  materiais_estoque: [['materiais_estoque']],
  materiais_seriais: [['materiais_estoque']],
  
  // Equipe
  equipe_operacional: [['equipe-operacional']],
  
  // Financeiro
  contas_pagar: [['contas-pagar']],
  contas_receber: [['contas-receber']],
  
  // Contratos
  contratos: [['contratos']],
  contratos_templates: [['contratos-templates']],
  
  // Transportadoras
  envios: [['envios']],
  transportadoras: [['transportadoras']],
  transportadoras_rotas: [['transportadoras']],
  
  // Usuários
  user_permissions: [['user-permissions'], ['usuarios']],
  profiles: [['profiles'], ['usuarios']],
};

// Singleton para garantir único canal em toda a aplicação
let globalChannel: ReturnType<typeof supabase.channel> | null = null;
let subscriberCount = 0;
let pendingInvalidations: Set<string> = new Set();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Hook centralizado para gerenciar realtime do Supabase
 * Consolida todos os canais em um único para melhor performance
 */
export function useRealtimeHub() {
  const queryClient = useQueryClient();

  useEffect(() => {
    subscriberCount++;

    // Criar canal global apenas uma vez
    if (!globalChannel) {
      globalChannel = supabase.channel('global-realtime-hub');

      // Registrar listeners para todas as tabelas
      const allTables: TableName[] = Object.keys(TABLE_QUERY_MAP) as TableName[];
      
      allTables.forEach(table => {
        globalChannel!.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            const queryKeys = TABLE_QUERY_MAP[table];
            if (queryKeys) {
              // Adicionar à fila de invalidação
              queryKeys.forEach(key => {
                pendingInvalidations.add(JSON.stringify(key));
              });

              // Debounce de 300ms para agrupar invalidações
              if (debounceTimer) {
                clearTimeout(debounceTimer);
              }
              
              debounceTimer = setTimeout(() => {
                if (pendingInvalidations.size === 0) return;
                
                const keysToInvalidate = Array.from(pendingInvalidations);
                pendingInvalidations.clear();

                const uniqueKeys = new Set<string>();
                keysToInvalidate.forEach(k => uniqueKeys.add(k));

                uniqueKeys.forEach(keyStr => {
                  const key = JSON.parse(keyStr);
                  queryClient.invalidateQueries({ queryKey: key });
                });
              }, 300);
            }
          }
        );
      });

      globalChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime Hub conectado');
        }
      });
    }

    return () => {
      subscriberCount--;
      
      // Só remover o canal quando não houver mais subscribers
      if (subscriberCount === 0 && globalChannel) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        pendingInvalidations.clear();
        console.log('🔴 Realtime Hub desconectado');
      }
    };
  }, [queryClient]);
}

/**
 * Hook para usar em contextos que precisam de realtime
 * mas não precisam da referência do hub
 */
export function useRealtimeSubscription() {
  useRealtimeHub();
}
