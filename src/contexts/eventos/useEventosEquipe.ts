import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DatabaseError, 
  getErrorMessage,
  EquipeMembroData,
  EquipeMembroFromDB
} from '@/types/utils';

export function useEventosEquipe(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: equipeData, isLoading } = useQuery({
    queryKey: ['eventos-equipe', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_equipe')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      
      // Transform snake_case to camelCase for UI
      return (data as EquipeMembroFromDB[])?.map(row => ({
        id: row.id,
        eventoId: row.evento_id,
        nome: row.nome,
        funcao: row.funcao,
        telefone: row.telefone,
        whatsapp: row.whatsapp,
        dataInicio: row.data_inicio,
        dataFim: row.data_fim,
        observacoes: row.observacoes,
        operacionalId: row.operacional_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })) || [];
    },
  });

  const adicionarMembroEquipe = useMutation({
    mutationFn: async (data: EquipeMembroData) => {
      const payload = {
        evento_id: eventoId,
        nome: data.nome,
        funcao: data.funcao,
        telefone: data.telefone,
        whatsapp: data.whatsapp ?? null,
        data_inicio: data.dataInicio ?? null,
        data_fim: data.dataFim ?? null,
        observacoes: data.observacoes ?? null,
        operacional_id: data.operacionalId ?? null,
      };
      
      const { error } = await supabase
        .from('eventos_equipe')
        .insert([payload])
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-equipe', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Membro adicionado à equipe!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Não foi possível adicionar o membro', {
        description: getErrorMessage(error),
      });
    },
  });

  const removerMembroEquipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_equipe')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-equipe', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Membro removido da equipe!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Não foi possível remover o membro', {
        description: getErrorMessage(error),
      });
    },
  });

  return {
    equipe: equipeData || [],
    loading: isLoading,
    adicionarMembroEquipe,
    removerMembroEquipe,
  };
}
