import { supabase } from '@/integrations/supabase/client';
import { ConflitoDatas } from '@/types/equipe';

export function useConflitosEquipe() {
  const verificarConflitos = async ({
    operacionalId,
    nome,
    funcao,
    dataInicio,
    dataFim,
    eventoAtualId
  }: {
    operacionalId?: string;
    nome?: string;
    funcao?: string;
    dataInicio: string;
    dataFim: string;
    eventoAtualId?: string;
  }): Promise<ConflitoDatas[]> => {
    try {
      let query = supabase
        .from('eventos_equipe')
        .select(`
          id,
          evento_id,
          nome,
          funcao,
          data_inicio,
          data_fim,
          eventos!inner(id, nome, data_inicio, data_fim, status)
        `);

      // Se tiver operacional_id, busca por ele
      if (operacionalId) {
        query = query.eq('operacional_id', operacionalId);
      } else if (nome && funcao) {
        // Senão, busca por nome + função (case insensitive)
        query = query.ilike('nome', nome).eq('funcao', funcao);
      } else {
        return [];
      }

      // Excluir o evento atual se estiver editando
      if (eventoAtualId) {
        query = query.neq('evento_id', eventoAtualId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Filtrar apenas os que têm conflito de datas
      const conflitos: ConflitoDatas[] = [];

      for (const alocacao of data) {
        const evento = alocacao.eventos as any;
        if (!evento) continue;

        // Usar datas da alocação se existirem, senão usar datas do evento
        const inicioAlocacao = new Date(alocacao.data_inicio || evento.data_inicio);
        const fimAlocacao = new Date(alocacao.data_fim || evento.data_fim);
        const inicioNovo = new Date(dataInicio);
        const fimNovo = new Date(dataFim);

        // Verifica se há sobreposição de datas
        const temConflito = 
          (inicioNovo <= fimAlocacao && fimNovo >= inicioAlocacao);

        if (temConflito) {
          conflitos.push({
            eventoId: alocacao.evento_id,
            eventoNome: evento.nome,
            dataInicio: alocacao.data_inicio || evento.data_inicio,
            dataFim: alocacao.data_fim || evento.data_fim
          });
        }
      }

      return conflitos;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return [];
    }
  };

  return {
    verificarConflitos
  };
}
