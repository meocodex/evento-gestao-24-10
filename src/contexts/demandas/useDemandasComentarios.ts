import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDemandasComentarios() {
  const queryClient = useQueryClient();

  const adicionarComentario = useMutation({
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
      
      const previousData = queryClient.getQueryData(['demandas']);
      
      // Atualizar cache localmente ANTES da resposta do servidor
      queryClient.setQueriesData({ queryKey: ['demandas'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          demandas: old.demandas?.map((d: any) => 
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
    onError: (error, variables, context) => {
      // Se der erro, reverter para estado anterior
      if (context?.previousData) {
        queryClient.setQueryData(['demandas'], context.previousData);
      }
      console.error('Erro ao adicionar comentário:', error);
      toast({ title: 'Erro ao adicionar comentário', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Comentário adicionado', description: 'Seu comentário foi publicado.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });

  return {
    adicionarComentario,
  };
}
