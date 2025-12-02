import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CadastroEventoPublico } from '@/types/eventos';

export function useCadastrosMutations() {
  const queryClient = useQueryClient();

  const criarCadastro = useMutation({
    mutationFn: async (data: CadastroEventoPublico): Promise<string> => {
      // Chamar edge function para criar evento e cliente
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-evento-publico`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            produtor: data.produtor,
            evento: {
              nome: data.nome,
              tipoEvento: data.tipoEvento,
              dataInicio: data.dataInicio,
              dataFim: data.dataFim,
              horaInicio: data.horaInicio,
              horaFim: data.horaFim,
              local: data.local,
              endereco: data.endereco,
              cidade: data.cidade,
              estado: data.estado,
              observacoes: data.observacoes,
            },
            configuracaoIngresso: data.configuracaoIngresso,
            configuracaoBar: data.configuracaoBar,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar evento');
      }

      const result = await response.json();
      return result.protocolo;
    },
    onSuccess: (protocolo) => {
      queryClient.invalidateQueries({ queryKey: ['cadastros-publicos'] });
      toast.success('Cadastro enviado!', { 
        description: `Seu protocolo: ${protocolo}. Use-o para acompanhar o status.` 
      });
    },
    onError: () => {
      toast.error('Erro ao criar cadastro');
    },
  });

  const aprovarCadastro = useMutation({
    mutationFn: async ({ cadastroId, eventoId }: { cadastroId: string; eventoId: string }) => {
      const { error } = await supabase
        .from('cadastros_publicos')
        .update({
          status: 'aprovado',
          evento_id: eventoId,
        })
        .eq('id', cadastroId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadastros-publicos'] });
      toast.success('Cadastro aprovado!', { description: 'Evento criado com sucesso.' });
    },
    onError: () => {
      toast.error('Erro ao aprovar cadastro');
    },
  });

  const recusarCadastro = useMutation({
    mutationFn: async ({ cadastroId, motivo }: { cadastroId: string; motivo: string }) => {
      const { error } = await supabase
        .from('cadastros_publicos')
        .update({
          status: 'recusado',
          observacoes_internas: motivo,
        })
        .eq('id', cadastroId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadastros-publicos'] });
      toast.success('Cadastro recusado', { description: 'O produtor será notificado sobre a recusa.' });
    },
    onError: () => {
      toast.error('Erro ao recusar cadastro');
    },
  });

  return {
    criarCadastro,
    criarCadastroEventoPublico: criarCadastro.mutateAsync,
    aprovarCadastro,
    recusarCadastro,
  };
}
