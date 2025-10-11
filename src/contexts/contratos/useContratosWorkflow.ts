import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useContratosWorkflow() {
  const queryClient = useQueryClient();

  const assinarContrato = useMutation({
    mutationFn: async ({ contratoId, parte }: { contratoId: string; parte: string }) => {
      // Buscar contrato atual
      const { data: contrato, error: fetchError } = await supabase
        .from('contratos')
        .select('assinaturas, status')
        .eq('id', contratoId)
        .single();

      if (fetchError) throw fetchError;

      const assinaturas = (contrato.assinaturas || []) as any[];
      
      // Atualizar assinatura
      const assinaturasAtualizadas = assinaturas.map((a: any) =>
        a.parte === parte
          ? { ...a, assinado: true, dataAssinatura: new Date().toISOString() }
          : a
      );

      const todasAssinadas = assinaturasAtualizadas.every((a: any) => a.assinado);

      const { error } = await supabase
        .from('contratos')
        .update({
          assinaturas: JSON.parse(JSON.stringify(assinaturasAtualizadas)),
          status: todasAssinadas ? 'assinado' : contrato.status,
        })
        .eq('id', contratoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Contrato assinado', description: 'Assinatura registrada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao assinar contrato:', error);
      toast({ title: 'Erro ao assinar contrato', variant: 'destructive' });
    },
  });

  const aprovarProposta = useMutation({
    mutationFn: async ({ contratoId, observacoes }: { contratoId: string; observacoes?: string }) => {
      // Buscar contrato atual
      const { data: contrato, error: fetchError } = await supabase
        .from('contratos')
        .select('aprovacoes_historico')
        .eq('id', contratoId)
        .single();

      if (fetchError) throw fetchError;

      const historico = (contrato.aprovacoes_historico || []) as any[];
      
      const novoHistorico = [
        ...historico,
        {
          data: new Date().toISOString(),
          acao: 'aprovada',
          usuario: 'Usuário Atual',
          observacoes
        }
      ];

      const { error } = await supabase
        .from('contratos')
        .update({
          status: 'aprovada',
          aprovacoes_historico: JSON.parse(JSON.stringify(novoHistorico)),
        })
        .eq('id', contratoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Proposta aprovada', description: 'A proposta foi aprovada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao aprovar proposta:', error);
      toast({ title: 'Erro ao aprovar proposta', variant: 'destructive' });
    },
  });

  const converterPropostaEmContrato = useMutation({
    mutationFn: async ({ 
      contratoId, 
      eventoId 
    }: { 
      contratoId: string; 
      eventoId: string;
    }) => {
      // Buscar contrato atual
      const { data: contrato, error: fetchError } = await supabase
        .from('contratos')
        .select('aprovacoes_historico')
        .eq('id', contratoId)
        .single();

      if (fetchError) throw fetchError;

      const historico = (contrato.aprovacoes_historico || []) as any[];
      
      const novoHistorico = [
        ...historico,
        {
          data: new Date().toISOString(),
          acao: 'convertida',
          usuario: 'Usuário Atual',
          observacoes: 'Proposta convertida em contrato'
        }
      ];

      const { error } = await supabase
        .from('contratos')
        .update({
          status: 'rascunho',
          evento_id: eventoId,
          aprovacoes_historico: JSON.parse(JSON.stringify(novoHistorico)),
        })
        .eq('id', contratoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: 'Proposta convertida', description: 'A proposta foi convertida em contrato com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao converter proposta:', error);
      toast({ title: 'Erro ao converter proposta', variant: 'destructive' });
    },
  });

  return {
    assinarContrato,
    aprovarProposta,
    converterPropostaEmContrato,
  };
}
