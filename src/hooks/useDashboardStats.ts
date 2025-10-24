import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

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
  
  // Financeiro
  receitaTotal: number;
  receitasPendentes: number;
  receitasPagas: number;
  despesaTotal: number;
  despesasPendentes: number;
  despesasPagas: number;
  lucroLiquido: number;
  margemLucro: number;
  
  // Cobranças
  cobrancasPendentes: number;
  valorCobrancasPendentes: number;
  cobrancasAtrasadas: number;
  
  // Estoque
  estoqueDisponivel: number;
  estoqueEmUso: number;
  estoqueManutencao: number;
  estoquePerdido: number;
  
  // Demandas
  demandasAbertas: number;
  demandasEmAndamento: number;
  demandasUrgentes: number;
  demandasAtrasadas: number;
  
  // Alertas
  alertas: {
    tipo: 'error' | 'warning' | 'info';
    mensagem: string;
    detalhes?: string;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    staleTime: 1000 * 60 * 5, // 5 minutos (views materializadas atualizam via triggers)
    queryFn: async (): Promise<DashboardStats> => {
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);
      const proximos7Dias = addDays(hoje, 7);

      // ===== EVENTOS (usando view materializada) =====
      const { data: eventosStats } = await supabase
        .from('vw_eventos_stats')
        .select('*');

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
        switch(row.status) {
          case 'orcamento_enviado': eventosPorStatus.orcamentoEnviado = total; break;
          case 'confirmado': eventosPorStatus.aprovado = total; break;
          case 'materiais_alocados': eventosPorStatus.materiaisAlocados = total; break;
          case 'em_andamento': eventosPorStatus.emAndamento = total; break;
          case 'finalizado': eventosPorStatus.concluido = total; break;
        }
      });

      // Buscar eventos para cálculo de próximos 7 dias (não está na view)
      const { data: eventos } = await supabase
        .from('eventos')
        .select('data_inicio');

      const eventosProximos = eventos?.filter(e => {
        const dataInicio = new Date(e.data_inicio);
        return isAfter(dataInicio, hoje) && isBefore(dataInicio, proximos7Dias);
      }) || [];

      // ===== FINANCEIRO (usando view materializada) =====
      const { data: financeiroStats } = await supabase
        .from('vw_financeiro_eventos')
        .select('*');

      const receitaTotal = financeiroStats?.reduce((sum, row) => sum + (Number(row.total_receitas) || 0), 0) || 0;
      const despesaTotal = financeiroStats?.reduce((sum, row) => sum + (Number(row.total_despesas) || 0), 0) || 0;

      // Buscar detalhes de receitas e despesas para status (não está na view)
      const { data: receitas } = await supabase
        .from('eventos_receitas')
        .select('valor, status, data')
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', fimMes.toISOString().split('T')[0]);

      const receitasPendentes = receitas?.filter(r => r.status === 'pendente').reduce((acc, r) => acc + Number(r.valor), 0) || 0;
      const receitasPagas = receitas?.filter(r => r.status === 'pago').reduce((acc, r) => acc + Number(r.valor), 0) || 0;

      const { data: despesas } = await supabase
        .from('eventos_despesas')
        .select('valor, status, data')
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', fimMes.toISOString().split('T')[0]);

      const despesasPendentes = despesas?.filter(d => d.status === 'pendente').reduce((acc, d) => acc + Number(d.valor), 0) || 0;
      const despesasPagas = despesas?.filter(d => d.status === 'pago').reduce((acc, d) => acc + Number(d.valor), 0) || 0;

      const lucroLiquido = receitaTotal - despesaTotal;
      const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

      // ===== COBRANÇAS =====
      const { data: cobrancas } = await supabase
        .from('eventos_cobrancas')
        .select('valor, status, created_at');

      const cobrancasPendentesData = cobrancas?.filter(c => c.status === 'pendente') || [];
      const valorCobrancasPendentes = cobrancasPendentesData.reduce((acc, c) => acc + Number(c.valor), 0);
      
      const cobrancasAtrasadas = cobrancasPendentesData.filter(c => {
        const diasDesde = differenceInDays(hoje, new Date(c.created_at));
        return diasDesde >= 15;
      }).length;

      // ===== ESTOQUE =====
      const { data: materiais } = await supabase
        .from('materiais_estoque')
        .select('quantidade_disponivel, quantidade_total');

      const estoqueDisponivel = materiais?.reduce((acc, m) => acc + Number(m.quantidade_disponivel), 0) || 0;
      const estoqueTotal = materiais?.reduce((acc, m) => acc + Number(m.quantidade_total), 0) || 0;

      const { data: seriais } = await supabase
        .from('materiais_seriais')
        .select('status');

      const estoqueEmUso = seriais?.filter(s => s.status === 'em-uso').length || 0;
      const estoqueManutencao = seriais?.filter(s => s.status === 'manutencao').length || 0;
      const estoquePerdido = 0; // Não há status "perdido" na tabela materiais_seriais

      // ===== DEMANDAS (usando view materializada) =====
      const { data: demandasStats } = await supabase
        .from('vw_demandas_stats')
        .select('*');

      const demandasAbertas = demandasStats?.find(d => d.status === 'aberta')?.total || 0;
      const demandasEmAndamento = demandasStats?.find(d => d.status === 'em-andamento')?.total || 0;
      const demandasUrgentes = demandasStats?.find(d => d.prioridade === 'urgente')?.total || 0;
      const demandasAtrasadas = demandasStats?.reduce((sum, d) => sum + (d.atrasadas || 0), 0) || 0;
      
      // Buscar prazos para validação de alertas (não está na view)
      const { data: demandas } = await supabase
        .from('demandas')
        .select('status, prioridade, prazo');

      // ===== ALERTAS =====
      const alertas: DashboardStats['alertas'] = [];

      // Cobranças atrasadas
      if (cobrancasAtrasadas > 0) {
        alertas.push({
          tipo: 'error',
          mensagem: `${cobrancasAtrasadas} cobrança${cobrancasAtrasadas > 1 ? 's' : ''} atrasada${cobrancasAtrasadas > 1 ? 's' : ''} há 15+ dias`,
          detalhes: 'Requer ação imediata'
        });
      }

      // Eventos de alto valor
      const { data: eventosAltoValor } = await supabase
        .from('eventos_receitas')
        .select('evento_id, valor')
        .gte('valor', 50000);
      
      const eventosUnicos = new Set(eventosAltoValor?.map(e => e.evento_id) || []).size;
      if (eventosUnicos > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `${eventosUnicos} evento${eventosUnicos > 1 ? 's' : ''} acima de R$ 50k`,
          detalhes: 'Validação necessária'
        });
      }

      // Estoque baixo (menos de 20% do total)
      const materiaisBaixos = materiais?.filter(m => {
        const percentual = (Number(m.quantidade_disponivel) / Number(m.quantidade_total)) * 100;
        return percentual < 20 && Number(m.quantidade_total) > 0;
      }).length || 0;

      if (materiaisBaixos > 0) {
        alertas.push({
          tipo: 'info',
          mensagem: `${materiaisBaixos} tipo${materiaisBaixos > 1 ? 's' : ''} de material com estoque baixo`,
          detalhes: 'Reabastecer em breve'
        });
      }

      // Materiais com retorno atrasado (usando status da tabela eventos_materiais_alocados)
      const { data: materiaisAlocados } = await supabase
        .from('eventos_materiais_alocados')
        .select('status, created_at')
        .in('status', ['separado', 'em_transito', 'entregue']);

      const materiaisAtrasados = materiaisAlocados?.filter(m => {
        const diasDesde = differenceInDays(hoje, new Date(m.created_at));
        return diasDesde > 7; // Mais de 7 dias em uso
      }).length || 0;

      if (materiaisAtrasados > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `${materiaisAtrasados} material${materiaisAtrasados > 1 ? 'ais' : ''} com retorno atrasado`,
          detalhes: 'Entrar em contato com produtores'
        });
      }

      // Demandas urgentes
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
        receitaTotal,
        receitasPendentes,
        receitasPagas,
        despesaTotal,
        despesasPendentes,
        despesasPagas,
        lucroLiquido,
        margemLucro,
        cobrancasPendentes: cobrancasPendentesData.length,
        valorCobrancasPendentes,
        cobrancasAtrasadas,
        estoqueDisponivel,
        estoqueEmUso,
        estoqueManutencao,
        estoquePerdido,
        demandasAbertas,
        demandasEmAndamento,
        demandasUrgentes,
        demandasAtrasadas,
        alertas,
      };
    },
  });
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

      // Receita gerada (dos eventos do comercial)
      const eventosIds = eventosMes.map(e => e.id);
      const { data: receitas } = await supabase
        .from('eventos_receitas')
        .select('valor')
        .in('evento_id', eventosIds);

      const receitaGerada = receitas?.reduce((acc, r) => acc + Number(r.valor), 0) || 0;

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
        orcamentosEmAnalise: eventos?.filter(e => e.status === 'orcamento_enviado').length || 0,
        contratosFechados,
        receitaGerada,
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
        .select('id')
        .eq('data_inicio', hoje.toISOString().split('T')[0]);

      // Rastreamentos ativos
      const { data: envios } = await supabase
        .from('envios')
        .select('status')
        .in('status', ['pendente', 'em_transito']);

      // Retornos atrasados
      const { data: materiaisAlocados } = await supabase
        .from('eventos_materiais_alocados')
        .select('status, created_at')
        .in('status', ['separado', 'em_transito', 'entregue']);

      const retornosAtrasados = materiaisAlocados?.filter(m => {
        const diasDesde = differenceInDays(hoje, new Date(m.created_at));
        return diasDesde > 7;
      }).length || 0;

      return {
        demandasPendentes,
        demandasUrgentes,
        operacoesHoje: eventosHoje?.length || 0,
        rastreamentosAtivos: envios?.length || 0,
        retornosAtrasados,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
