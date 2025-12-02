import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventoFormData } from '@/types/eventos';

export function useEventosPropostas() {
  const queryClient = useQueryClient();

  const criarDeContrato = useMutation({
    mutationFn: async ({ 
      contratoId, 
      dadosEvento 
    }: { 
      contratoId: string; 
      dadosEvento: any 
    }) => {
      // 1. Buscar dados do contrato
      const { data: contrato, error: fetchError } = await supabase
        .from('contratos')
        .select('*, cliente:clientes(*)')
        .eq('id', contratoId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Mapear dados do contrato para EventoFormData
      const eventoData: EventoFormData = {
        nome: dadosEvento.nome || contrato.titulo,
        descricao: dadosEvento.descricao || contrato.observacoes,
        clienteId: contrato.cliente_id || '',
        comercialId: dadosEvento.comercialId,
        dataInicio: dadosEvento.dataInicio || contrato.data_inicio,
        dataFim: dadosEvento.dataFim || contrato.data_fim,
        horaInicio: dadosEvento.horaInicio || '18:00',
        horaFim: dadosEvento.horaFim || '23:00',
        local: dadosEvento.local || '',
        endereco: dadosEvento.endereco || '',
        cidade: dadosEvento.cidade || '',
        estado: dadosEvento.estado || '',
        tipoEvento: dadosEvento.tipoEvento || 'ingresso',
        observacoes: contrato.observacoes_comerciais || '',
        tags: []
      };

      // 3. Criar evento usando o mutation padrão
      const { data: novoEvento, error: createError } = await supabase
        .from('eventos')
        .insert([{
          nome: eventoData.nome,
          descricao: eventoData.descricao,
          cliente_id: eventoData.clienteId,
          comercial_id: eventoData.comercialId,
          data_inicio: eventoData.dataInicio,
          data_fim: eventoData.dataFim,
          hora_inicio: eventoData.horaInicio,
          hora_fim: eventoData.horaFim,
          local: eventoData.local,
          endereco: eventoData.endereco,
          cidade: eventoData.cidade,
          estado: eventoData.estado,
          tipo_evento: eventoData.tipoEvento,
          observacoes: eventoData.observacoes,
          tags: eventoData.tags,
          status: 'orcamento_enviado'
        }])
        .select()
        .single();

      if (createError) throw createError;

      // 4. Criar entrada na timeline
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('eventos_timeline').insert([{
        evento_id: novoEvento.id,
        tipo: 'criacao',
        descricao: `Evento criado a partir do contrato ${contrato.numero}`,
        usuario: user?.email || 'Sistema',
        data: new Date().toISOString()
      }]);

      return novoEvento.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Evento criado!', {
        description: 'Evento criado a partir da proposta com sucesso.'
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar evento', {
        description: error.message
      });
    }
  });

  const adicionarReceitasLote = useMutation({
    mutationFn: async ({ 
      eventoId, 
      itens 
    }: { 
      eventoId: string; 
      itens: any[] 
    }) => {
      // Mapear itens para o formato de receitas
      const receitas = itens.map(item => ({
        evento_id: eventoId,
        descricao: item.descricao || item.nome,
        tipo: 'fixo' as const,
        valor: item.valor || item.valorTotal,
        valor_unitario: item.valorUnitario || item.valor,
        quantidade: item.quantidade || 1,
        status: 'pendente' as const,
        data: new Date().toISOString().split('T')[0]
      }));

      // Bulk insert
      const { data, error } = await supabase
        .from('eventos_receitas')
        .insert(receitas)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Receitas adicionadas!', {
        description: `${variables.itens.length} receita(s) importada(s) com sucesso.`
      });
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar receitas', {
        description: error.message
      });
    }
  });

  return {
    criarDeContrato,
    adicionarReceitasLote
  };
}
