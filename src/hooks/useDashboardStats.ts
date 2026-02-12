import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import type { ChecklistItem } from '@/types/eventos';

export interface DashboardStats {
  // Eventos
  totalEventos: number;
  eventosPorStatus: {
    orcamentoEnviado: number;
    aprovado: number;
    materiaisAlocados: number;
    emAndamento: number;
    concluido: number;
  };
  eventosProximos7Dias: number;
  
  // Demandas
  demandasAbertas: number;
  demandasEmAndamento: number;
  demandasUrgentes: number;
  demandasAtrasadas: number;
  
  // Alertas operacionais
  alertas: {
    tipo: 'error' | 'warning' | 'info';
    mensagem: string;
    detalhes?: string;
  }[];
}

export function useDashboardStats() {
  const query = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const hoje = new Date();
      const proximos7Dias = addDays(hoje, 7);

      // ===== QUERIES PARALELAS PARA MÁXIMA PERFORMANCE =====
      const [
        { data: eventosStats },
        { data: eventos },
        { data: demandasStats },
        { data: materiaisAlocados },
        { data: eventosEquipe }
      ] = await Promise.all([
        // Query 1: Stats de eventos (view materializada)
        supabase.from('vw_eventos_stats').select('*'),
        // Query 2: Eventos com checklist
        supabase.from('eventos').select('id, data_inicio, status, nome, cliente_id, eventos_checklist(alocado, quantidade)'),
        // Query 3: Stats de demandas (view materializada)
        supabase.from('vw_demandas_stats').select('*'),
        // Query 4: Materiais alocados pendentes
        supabase.from('eventos_materiais_alocados').select('id, nome, evento_id, status_devolucao, data_devolucao').eq('status_devolucao', 'pendente'),
        // Query 5: Eventos com equipe
        supabase.from('eventos_equipe').select('evento_id')
      ]);

      // ===== PROCESSAR EVENTOS =====
      const eventosPorStatus = {
        orcamentoEnviado: 0,
        aprovado: 0,
        materiaisAlocados: 0,
        emAndamento: 0,
        concluido: 0,
      };

      let totalEventosMes = 0;
      eventosStats?.forEach(row => {
        const total = row.total || 0;
        totalEventosMes += total;
        const status = row.status as string;
        switch(status) {
          case 'orcamento_enviado': case 'orcamento': eventosPorStatus.orcamentoEnviado = total; break;
          case 'confirmado': eventosPorStatus.aprovado = total; break;
          case 'materiais_alocados': case 'em_preparacao': eventosPorStatus.materiaisAlocados = total; break;
          case 'em_andamento': case 'em_execucao': eventosPorStatus.emAndamento = total; break;
          case 'finalizado': case 'concluido': eventosPorStatus.concluido = total; break;
        }
      });

      const eventosProximos = eventos?.filter(e => {
        const dataInicio = new Date(e.data_inicio);
        return isAfter(dataInicio, hoje) && isBefore(dataInicio, proximos7Dias);
      }) || [];

      // ===== PROCESSAR DEMANDAS =====
      const demandasAbertas = demandasStats?.find(d => d.status === 'aberta')?.total || 0;
      const demandasEmAndamento = demandasStats?.find(d => d.status === 'em-andamento')?.total || 0;
      const demandasUrgentes = demandasStats?.find(d => d.prioridade === 'urgente')?.total || 0;
      const demandasAtrasadas = demandasStats?.reduce((sum, d) => sum + (d.atrasadas || 0), 0) || 0;

      // ===== ALERTAS OPERACIONAIS =====
      const alertas: DashboardStats['alertas'] = [];

      // Materiais com retorno atrasado
      const materiaisAtrasados = materiaisAlocados?.filter(m => {
        return eventos?.some(e => {
          if (e.id === m.evento_id) {
            const dataFim = new Date(e.data_inicio);
            const diasDesde = differenceInDays(hoje, dataFim);
            return diasDesde > 7;
          }
          return false;
        });
      }) || [];

      if (materiaisAtrasados.length > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `${materiaisAtrasados.length} material${materiaisAtrasados.length > 1 ? 'ais' : ''} com retorno atrasado`,
          detalhes: 'Evento finalizado há mais de 7 dias'
        });
      }

      // Eventos próximos sem materiais alocados
      const eventosSemMateriais = eventosProximos.filter(e => {
        const checklist = e.eventos_checklist as ChecklistItem[];
        if (!checklist || checklist.length === 0) return true;
        return checklist.some(item => item.alocado < item.quantidade);
      });

      if (eventosSemMateriais.length > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `${eventosSemMateriais.length} evento${eventosSemMateriais.length > 1 ? 's' : ''} próximo${eventosSemMateriais.length > 1 ? 's' : ''} sem materiais completos`,
          detalhes: 'Alocar materiais para os eventos'
        });
      }

      // Eventos próximos sem equipe
      const eventosComEquipe = new Set(eventosEquipe?.map(e => e.evento_id) || []);
      const eventosSemEquipe = eventosProximos.filter(e => !eventosComEquipe.has(e.id));

      if (eventosSemEquipe.length > 0) {
        alertas.push({
          tipo: 'info',
          mensagem: `${eventosSemEquipe.length} evento${eventosSemEquipe.length > 1 ? 's' : ''} sem equipe definida`,
          detalhes: 'Definir membros da equipe operacional'
        });
      }

      // Demandas urgentes não atendidas
      if (demandasUrgentes > 0) {
        alertas.push({
          tipo: 'error',
          mensagem: `${demandasUrgentes} demanda${demandasUrgentes > 1 ? 's' : ''} urgente${demandasUrgentes > 1 ? 's' : ''}`,
          detalhes: 'Requer atenção imediata'
        });
      }

      return {
        totalEventos: totalEventosMes,
        eventosPorStatus,
        eventosProximos7Dias: eventosProximos.length,
        demandasAbertas,
        demandasEmAndamento,
        demandasUrgentes,
        demandasAtrasadas,
        alertas,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (aumentado - realtime hub cuida das atualizações)
    gcTime: 1000 * 60 * 15,
  });

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  return query;
}

// Hook específico para comercial (seus eventos)
export function useComercialStats(userId: string) {
  return useQuery({
    queryKey: ['comercial-stats', userId],
    queryFn: async () => {
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);
      const proximos7Dias = addDays(hoje, 7);

      // Eventos do comercial
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, status, data_inicio, created_at')
        .eq('comercial_id', userId);

      const eventosMes = eventos?.filter(e => {
        const createdAt = new Date(e.created_at);
        return createdAt >= inicioMes && createdAt <= fimMes;
      }) || [];

      const eventosProximos = eventos?.filter(e => {
        const dataInicio = new Date(e.data_inicio);
        return isAfter(dataInicio, hoje) && isBefore(dataInicio, proximos7Dias);
      }).sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()) || [];

      // Contratos fechados
      const { data: contratos } = await supabase
        .from('contratos')
        .select('status, created_at')
        .gte('created_at', inicioMes.toISOString())
        .lte('created_at', fimMes.toISOString());

      const contratosFechados = contratos?.filter(c => c.status === 'assinado' || c.status === 'aprovada').length || 0;

      // Demandas criadas pelo comercial
      const { data: demandas } = await supabase
        .from('demandas')
        .select('status, created_at')
        .eq('solicitante_id', userId);

      const demandasCriadas = demandas?.filter(d => d.status === 'aberta').length || 0;
      const demandasConcluidas = demandas?.filter(d => {
        const createdAt = new Date(d.created_at);
        return d.status === 'concluida' && 
               createdAt >= new Date(hoje.setHours(0,0,0,0)) && 
               createdAt <= hoje;
      }).length || 0;

      return {
        meusEventos: eventosMes.length,
        orcamentosEmAnalise: eventos?.filter(e => (e.status as string) === 'orcamento_enviado' || e.status === 'orcamento').length || 0,
        contratosFechados,
        eventosProximos,
        demandasCriadas,
        demandasConcluidas,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Hook específico para suporte
export function useSuporteStats() {
  return useQuery({
    queryKey: ['suporte-stats'],
    queryFn: async () => {
      const hoje = new Date();

      // Demandas pendentes
      const { data: demandas } = await supabase
        .from('demandas')
        .select('status, prioridade');

      const demandasPendentes = demandas?.filter(d => d.status === 'aberta' || d.status === 'em-andamento').length || 0;
      const demandasUrgentes = demandas?.filter(d => d.prioridade === 'urgente' && d.status !== 'concluida').length || 0;

      // Operações hoje (eventos acontecendo hoje)
      const { data: eventosHoje } = await supabase
        .from('eventos')
        .select('id, nome, local, hora_inicio, hora_fim')
        .eq('data_inicio', hoje.toISOString().split('T')[0]);

      // Rastreamentos ativos
      const { data: envios } = await supabase
        .from('envios')
        .select('id, rastreio, status, tipo')
        .in('status', ['pendente', 'em_transito']);

      // Retornos atrasados
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, data_inicio');

      const { data: materiaisAlocados } = await supabase
        .from('eventos_materiais_alocados')
        .select('id, nome, evento_id, status_devolucao')
        .eq('status_devolucao', 'pendente');

      const retornosAtrasados = materiaisAlocados?.filter(m => {
        const evento = eventos?.find(e => e.id === m.evento_id);
        if (evento) {
          const diasDesde = differenceInDays(hoje, new Date(evento.data_inicio));
          return diasDesde > 7;
        }
        return false;
      }).length || 0;

      return {
        demandasPendentes,
        demandasUrgentes,
        operacoesHoje: eventosHoje || [],
        rastreamentosAtivos: envios || [],
        retornosAtrasados,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
