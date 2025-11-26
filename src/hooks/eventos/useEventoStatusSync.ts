import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Evento, StatusEvento } from '@/types/eventos';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook para sincronizar automaticamente o status do evento com base nas datas
 * Atualiza o status quando o evento deveria iniciar ou finalizar
 */
export function useEventoStatusSync(evento: Evento | null | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!evento || !user) return;

    const verificarEAtualizar = async () => {
      try {
        const now = new Date();
        const inicio = new Date(`${evento.dataInicio}T${evento.horaInicio}`);
        const fim = new Date(`${evento.dataFim}T${evento.horaFim}`);

        let novoStatus: StatusEvento | null = null;
        let tipoTimeline: string = '';
        let descricao: string = '';

        // Verificar se precisa iniciar execução
        if (now >= inicio && now < fim && 
            (evento.status === 'confirmado' || evento.status === 'em_preparacao')) {
          novoStatus = 'em_execucao';
          tipoTimeline = 'status';
          descricao = 'Evento iniciado automaticamente';
        }
        
        // Verificar se precisa finalizar
        else if (now >= fim && evento.status === 'em_execucao') {
          novoStatus = 'finalizado';
          tipoTimeline = 'status';
          descricao = 'Evento finalizado automaticamente';
        }

        // Se detectou mudança de status necessária
        if (novoStatus) {
          // Atualizar status no banco
          const { error: updateError } = await supabase
            .from('eventos')
            .update({ status: novoStatus })
            .eq('id', evento.id);

          if (updateError) throw updateError;

          // Registrar na timeline
          const { error: timelineError } = await supabase
            .from('eventos_timeline')
            .insert({
              evento_id: evento.id,
              tipo: tipoTimeline,
              descricao,
              usuario: 'Sistema (Automático)',
              data: new Date().toISOString()
            });

          if (timelineError) throw timelineError;

          // Invalidar caches para refletir mudanças
          queryClient.invalidateQueries({ queryKey: ['eventos'] });
          queryClient.invalidateQueries({ queryKey: ['evento-detalhes', evento.id] });
        }
      } catch (error) {
        console.error('Erro ao sincronizar status do evento:', error);
      }
    };

    verificarEAtualizar();
  }, [evento?.id, evento?.status, evento?.dataInicio, evento?.horaInicio, evento?.dataFim, evento?.horaFim, user, queryClient]);
}
