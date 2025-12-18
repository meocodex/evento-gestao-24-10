import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { DemandasQueryCache, DatabaseError } from '@/types/utils';
import type { Demanda } from '@/types/demandas';

export function useDemandasConversa() {
  const queryClient = useQueryClient();

  const adicionarMensagem = useMutation({
    mutationFn: async ({ 
      demandaId, 
      conteudo, 
      autor, 
      autorId 
    }: { 
      demandaId: string; 
      conteudo: string; 
      autor: string; 
      autorId: string;
    }) => {
      const { error } = await supabase
        .from('demandas_comentarios')
        .insert({
          demanda_id: demandaId,
          autor,
          autor_id: autorId,
          conteudo,
          tipo: 'comentario',
        });

      if (error) throw error;
    },
    onMutate: async ({ demandaId, conteudo, autor, autorId }) => {
      await queryClient.cancelQueries({ queryKey: ['demandas'] });
      
      const previousData = queryClient.getQueryData<DemandasQueryCache>(['demandas']);
      
      // Atualizar cache localmente ANTES da resposta do servidor
      queryClient.setQueriesData<DemandasQueryCache>({ queryKey: ['demandas'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          demandas: old.demandas?.map((d) => 
            d.id === demandaId 
              ? {
                  ...d,
                  comentarios: [
                    ...(d.comentarios || []),
                    {
                      id: 'temp-' + Date.now(),
                      autor,
                      autorId,
                      conteudo,
                      dataHora: new Date().toISOString(),
                      tipo: 'comentario'
                    }
                  ]
                }
              : d
          )
        };
      });
      
      return { previousData };
    },
    onError: (error: DatabaseError, variables, context) => {
      // Se der erro, reverter para estado anterior
      if (context?.previousData) {
        queryClient.setQueryData(['demandas'], context.previousData);
      }
      toast({ title: 'Erro ao adicionar mensagem', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Mensagem enviada', description: 'Sua mensagem foi publicada.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });

  return {
    adicionarMensagem,
  };
}
