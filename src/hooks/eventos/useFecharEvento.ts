import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Evento, Receita, Despesa } from '@/types/eventos';

interface FecharEventoParams {
  evento: Evento;
  receitasSelecionadas: string[];
  despesasSelecionadas: string[];
}

export function useFecharEvento() {
  const queryClient = useQueryClient();

  const fecharEventoMutation = useMutation({
    mutationFn: async ({ evento, receitasSelecionadas, despesasSelecionadas }: FecharEventoParams) => {
      const receitasFiltradas = evento.financeiro.receitas.filter(r => receitasSelecionadas.includes(r.id));
      const despesasFiltradas = evento.financeiro.despesas.filter(d => despesasSelecionadas.includes(d.id));
      const clienteNome = evento.cliente?.nome || 'Sem cliente';

      // 1. Verificar se já foi contabilizado
      const { data: existentes } = await supabase
        .from('contas_receber')
        .select('id')
        .eq('evento_id', evento.id)
        .limit(1);

      if (existentes && existentes.length > 0) {
        throw new Error('Este evento já foi contabilizado no financeiro geral.');
      }

      // 2. Inserir receitas como contas a receber
      if (receitasFiltradas.length > 0) {
        const contasReceber = receitasFiltradas.map((receita: Receita) => ({
          descricao: `${evento.nome} - ${receita.descricao}`,
          tipo: mapTipoReceita(receita.tipo),
          valor: receita.valor,
          valor_unitario: receita.valorUnitario,
          quantidade: receita.quantidade,
          data_vencimento: receita.data,
          status: 'recebido',
          data_recebimento: new Date().toISOString().split('T')[0],
          forma_recebimento: 'Transferencia',
          cliente: clienteNome,
          recorrencia: 'unico',
          observacoes: `Fechamento do evento: ${evento.nome}`,
          evento_id: evento.id,
        }));

        const { error: erroReceitas } = await supabase
          .from('contas_receber')
          .insert(contasReceber);

        if (erroReceitas) throw erroReceitas;
      }

      // 3. Inserir despesas como contas a pagar
      if (despesasFiltradas.length > 0) {
        const contasPagar = despesasFiltradas.map((despesa: Despesa) => ({
          descricao: `${evento.nome} - ${despesa.descricao}`,
          categoria: String(despesa.categoria),
          valor: despesa.valor,
          valor_unitario: despesa.valorUnitario,
          quantidade: despesa.quantidade,
          data_vencimento: despesa.data || evento.dataFim,
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento: 'Transferencia',
          fornecedor: despesa.responsavel || null,
          recorrencia: 'unico',
          observacoes: `Fechamento do evento: ${evento.nome}`,
          evento_id: evento.id,
        }));

        const { error: erroDespesas } = await supabase
          .from('contas_pagar')
          .insert(contasPagar);

        if (erroDespesas) throw erroDespesas;
      }

      // 4. Arquivar o evento
      const { error: erroArquivar } = await supabase
        .from('eventos')
        .update({ arquivado: true })
        .eq('id', evento.id);

      if (erroArquivar) throw erroArquivar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
      toast.success('Evento fechado e contabilizado no financeiro com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fechar evento');
    },
  });

  return {
    fecharEvento: fecharEventoMutation.mutateAsync,
    isLoading: fecharEventoMutation.isPending,
  };
}

function mapTipoReceita(tipo: string): string {
  const map: Record<string, string> = {
    venda: 'venda',
    locacao: 'locacao',
    servico: 'servico',
    outros: 'outros',
  };
  return map[tipo] || 'outros';
}
