import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Contrato } from '@/types/contratos';

export function useContratosMutations() {
  const queryClient = useQueryClient();

  const criarContrato = useMutation({
    mutationFn: async (data: Omit<Contrato, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      const { error } = await supabase
        .from('contratos')
        .insert({
          template_id: data.templateId,
          numero: data.numero,
          titulo: data.titulo,
          tipo: data.tipo,
          status: data.status,
          cliente_id: data.clienteId,
          evento_id: data.eventoId,
          valor: data.valor,
          conteudo: data.conteudo,
          data_inicio: data.dataInicio,
          data_fim: data.dataFim,
          validade: data.validade,
          itens: data.itens ? JSON.parse(JSON.stringify(data.itens)) : null,
          condicoes_pagamento: data.condicoesPagamento,
          prazo_execucao: data.prazoExecucao,
          garantia: data.garantia,
          observacoes: data.observacoes,
          observacoes_comerciais: data.observacoesComerciais,
          assinaturas: data.assinaturas ? JSON.parse(JSON.stringify(data.assinaturas)) : [],
          anexos: data.anexos || [],
          dados_evento: data.dadosEvento ? JSON.parse(JSON.stringify(data.dadosEvento)) : null,
          aprovacoes_historico: data.aprovacoesHistorico ? JSON.parse(JSON.stringify(data.aprovacoesHistorico)) : [],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Contrato criado', description: 'Contrato criado com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao criar contrato:', error);
      toast({ title: 'Erro ao criar contrato', variant: 'destructive' });
    },
  });

  const editarContrato = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contrato> }) => {
      const updateData: any = {};
      if (data.templateId !== undefined) updateData.template_id = data.templateId;
      if (data.numero !== undefined) updateData.numero = data.numero;
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.clienteId !== undefined) updateData.cliente_id = data.clienteId;
      if (data.eventoId !== undefined) updateData.evento_id = data.eventoId;
      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.conteudo !== undefined) updateData.conteudo = data.conteudo;
      if (data.dataInicio !== undefined) updateData.data_inicio = data.dataInicio;
      if (data.dataFim !== undefined) updateData.data_fim = data.dataFim;
      if (data.validade !== undefined) updateData.validade = data.validade;
      if (data.itens !== undefined) updateData.itens = JSON.parse(JSON.stringify(data.itens));
      if (data.condicoesPagamento !== undefined) updateData.condicoes_pagamento = data.condicoesPagamento;
      if (data.prazoExecucao !== undefined) updateData.prazo_execucao = data.prazoExecucao;
      if (data.garantia !== undefined) updateData.garantia = data.garantia;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.observacoesComerciais !== undefined) updateData.observacoes_comerciais = data.observacoesComerciais;
      if (data.assinaturas !== undefined) updateData.assinaturas = JSON.parse(JSON.stringify(data.assinaturas));
      if (data.anexos !== undefined) updateData.anexos = data.anexos;
      if (data.dadosEvento !== undefined) updateData.dados_evento = JSON.parse(JSON.stringify(data.dadosEvento));
      if (data.aprovacoesHistorico !== undefined) updateData.aprovacoes_historico = JSON.parse(JSON.stringify(data.aprovacoesHistorico));

      const { error } = await supabase
        .from('contratos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Contrato atualizado', description: 'Contrato atualizado com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao editar contrato:', error);
      toast({ title: 'Erro ao editar contrato', variant: 'destructive' });
    },
  });

  const excluirContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Contrato excluído', description: 'Contrato removido do sistema.' });
    },
    onError: (error) => {
      console.error('Erro ao excluir contrato:', error);
      toast({ title: 'Erro ao excluir contrato', variant: 'destructive' });
    },
  });

  return {
    criarContrato,
    editarContrato,
    excluirContrato,
  };
}
