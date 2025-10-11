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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Comentário adicionado', description: 'Seu comentário foi publicado.' });
    },
    onError: (error) => {
      console.error('Erro ao adicionar comentário:', error);
      toast({ title: 'Erro ao adicionar comentário', variant: 'destructive' });
    },
  });

  return {
    adicionarComentario,
  };
}
