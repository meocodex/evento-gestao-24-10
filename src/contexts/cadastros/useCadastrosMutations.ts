import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CadastroEventoPublico } from '@/types/eventos';

export function useCadastrosMutations() {
  const queryClient = useQueryClient();

  const criarCadastro = useMutation({
    mutationFn: async (data: CadastroEventoPublico): Promise<string> => {
      // Gerar protocolo
      const ano = new Date().getFullYear();
      const mes = String(new Date().getMonth() + 1).padStart(2, '0');
      const dia = String(new Date().getDate()).padStart(2, '0');
      
      // Buscar contagem para número sequencial
      const { count } = await supabase
        .from('cadastros_publicos')
        .select('*', { count: 'exact', head: true });
      
      const numero = String((count || 0) + 1).padStart(3, '0');
      const protocolo = `CAD-${ano}${mes}${dia}-${numero}`;

      const { error } = await supabase
        .from('cadastros_publicos')
        .insert({
          protocolo,
          nome: data.nome,
          tipo_evento: data.tipoEvento,
          data_inicio: data.dataInicio,
          data_fim: data.dataFim,
          hora_inicio: data.horaInicio,
          hora_fim: data.horaFim,
          local: data.local,
          cidade: data.cidade,
          estado: data.estado,
          endereco: data.endereco,
          produtor: JSON.parse(JSON.stringify(data.produtor)),
          configuracao_ingresso: data.configuracaoIngresso ? JSON.parse(JSON.stringify(data.configuracaoIngresso)) : null,
          configuracao_bar: data.configuracaoBar ? JSON.parse(JSON.stringify(data.configuracaoBar)) : null,
          status: 'pendente',
        });

      if (error) throw error;
      return protocolo;
    },
    onSuccess: (protocolo) => {
      queryClient.invalidateQueries({ queryKey: ['cadastros-publicos'] });
      toast({ 
        title: 'Cadastro enviado!', 
        description: `Seu protocolo: ${protocolo}. Use-o para acompanhar o status.` 
      });
    },
    onError: (error) => {
      console.error('Erro ao criar cadastro:', error);
      toast({ title: 'Erro ao criar cadastro', variant: 'destructive' });
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
      toast({ title: 'Cadastro aprovado!', description: 'Evento criado com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao aprovar cadastro:', error);
      toast({ title: 'Erro ao aprovar cadastro', variant: 'destructive' });
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
      toast({ title: 'Cadastro recusado', description: 'O produtor será notificado sobre a recusa.' });
    },
    onError: (error) => {
      console.error('Erro ao recusar cadastro:', error);
      toast({ title: 'Erro ao recusar cadastro', variant: 'destructive' });
    },
  });

  return {
    criarCadastro,
    criarCadastroEventoPublico: criarCadastro.mutateAsync,
    aprovarCadastro: aprovarCadastro.mutateAsync,
    recusarCadastro: recusarCadastro.mutateAsync,
  };
}
