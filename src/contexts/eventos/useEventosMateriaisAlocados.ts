import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosMateriaisAlocados(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: materiaisData, isLoading } = useQuery({
    queryKey: ['eventos-materiais-alocados', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const alocarMaterial = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .insert({ ...data, evento_id: eventoId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Material alocado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao alocar material:', error);
      toast.error(`Erro ao alocar material: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const alocarMaterialLote = useMutation({
    mutationFn: async (dados: any[]) => {
      const inserts = dados.map(data => ({
        ...data,
        evento_id: eventoId
      }));
      
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .insert(inserts);
      
      if (error) throw error;
      return inserts.length;
    },
    onSuccess: (count: number) => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success(`${count} ${count === 1 ? 'material alocado' : 'materiais alocados'} com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao alocar materiais em lote:', error);
      toast.error(`Erro ao alocar materiais: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const registrarDevolucao = useMutation({
    mutationFn: async ({ alocacaoId, statusDevolucao, observacoes, fotos }: {
      alocacaoId: string;
      statusDevolucao: string;
      observacoes: string;
      fotos?: string[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .update({
          status_devolucao: statusDevolucao,
          data_devolucao: new Date().toISOString(),
          responsavel_devolucao: user.user?.id,
          observacoes_devolucao: observacoes,
          fotos_devolucao: fotos,
        })
        .eq('id', alocacaoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['historico-material'] });
      toast.success('Devolução registrada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao registrar devolução:', error);
      toast.error(`Erro ao registrar devolução: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const removerMaterialAlocado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Material removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao remover material:', error);
      toast.error(`Erro ao remover material: ${error.message || 'Erro desconhecido'}`);
    },
  });

  // Listener para updates em tempo real
  useEffect(() => {
    const channel = supabase
      .channel(`evento-materiais-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eventos_materiais_alocados',
          filter: `evento_id=eq.${eventoId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
          queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, queryClient]);

  const registrarRetirada = useMutation({
    mutationFn: async (dados: {
      alocacaoIds: string[];
      retiradoPorNome: string;
      retiradoPorDocumento: string;
      retiradoPorTelefone: string;
    }) => {
      const { gerarTermoRetirada, uploadTermoRetirada } = await import('@/utils/termoRetiradaPDF');
      
      // Buscar dados dos materiais e evento
      const { data: materiaisData } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (nome, local, data_inicio, hora_inicio, endereco, cidade)
        `)
        .in('id', dados.alocacaoIds);
      
      if (!materiaisData || materiaisData.length === 0) {
        throw new Error('Materiais não encontrados');
      }

      const evento = materiaisData[0].eventos as any;

      // Buscar configurações da empresa
      const { data: user } = await supabase.auth.getUser();
      const { data: config } = await supabase
        .from('configuracoes_usuario')
        .select('empresa')
        .eq('user_id', user.user?.id)
        .single();

      // Gerar PDF
      const dadosRetirada = {
        retiradoPorNome: dados.retiradoPorNome,
        retiradoPorDocumento: dados.retiradoPorDocumento,
        retiradoPorTelefone: dados.retiradoPorTelefone,
        materiais: materiaisData.map(m => ({
          serial: m.serial || 'N/A',
          nome: m.nome,
          localizacao: 'Estoque',
          valorDeclarado: 0,
        })),
        eventoNome: evento.nome,
        eventoLocal: `${evento.local}, ${evento.endereco}, ${evento.cidade}`,
        eventoData: new Date(evento.data_inicio).toLocaleDateString('pt-BR'),
        eventoHora: evento.hora_inicio,
        dadosEmpresa: config?.empresa || {
          nome: 'Empresa',
          cnpj: '',
          telefone: '',
          endereco: '',
        },
      };

      const pdfBlob = await gerarTermoRetirada(dadosRetirada);

      // Upload do PDF
      const fileName = `termo-retirada-${eventoId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documentos-transporte')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos-transporte')
        .getPublicUrl(fileName);

      // Atualizar registros
      const { error: updateError } = await supabase
        .from('eventos_materiais_alocados')
        .update({
          retirado_por_nome: dados.retiradoPorNome,
          retirado_por_documento: dados.retiradoPorDocumento,
          retirado_por_telefone: dados.retiradoPorTelefone,
          termo_retirada_url: publicUrl,
          data_retirada: new Date().toISOString(),
        })
        .in('id', dados.alocacaoIds);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Termo de retirada gerado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao gerar termo:', error);
      toast.error(`Erro ao gerar termo: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const gerarDeclaracaoTransporte = useMutation({
    mutationFn: async (dados: {
      alocacaoIds: string[];
      remetenteTipo: 'empresa' | 'membro_equipe';
      remetenteMembroId?: string;
      valoresDeclarados: Record<string, number>;
      observacoes?: string;
    }) => {
      const { gerarDeclaracaoTransporte: gerarPDF } = await import('@/utils/declaracaoTransportePDF');
      
      // Buscar dados dos materiais e evento
      const { data: materiaisData } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (
            nome, local, data_inicio, hora_inicio, endereco, cidade,
            clientes!inner (nome, documento, telefone, endereco)
          )
        `)
        .in('id', dados.alocacaoIds);
      
      if (!materiaisData || materiaisData.length === 0) {
        throw new Error('Materiais não encontrados');
      }

      const evento = materiaisData[0].eventos as any;
      const cliente = evento.clientes;

      // Buscar dados do remetente
      let remetenteDados;
      if (dados.remetenteTipo === 'empresa') {
        const { data: user } = await supabase.auth.getUser();
        const { data: config } = await supabase
          .from('configuracoes_usuario')
          .select('empresa')
          .eq('user_id', user.user?.id)
          .single();
        
        remetenteDados = {
          tipo: 'empresa' as const,
          nome: config?.empresa?.nome || 'Empresa',
          documento: config?.empresa?.cnpj || '',
          telefone: config?.empresa?.telefone || '',
          endereco: config?.empresa?.endereco?.logradouro || '',
        };
      } else {
        const { data: membro } = await supabase
          .from('equipe_operacional')
          .select('*')
          .eq('id', dados.remetenteMembroId!)
          .single();
        
        remetenteDados = {
          tipo: 'membro_equipe' as const,
          nome: membro?.nome || '',
          documento: membro?.cpf || '',
          telefone: membro?.telefone || '',
          vinculo: membro?.funcao_principal || '',
        };
      }

      // Gerar PDF
      const dadosDeclaracao = {
        remetenteTipo: dados.remetenteTipo,
        remetenteNome: remetenteDados.nome,
        remetenteDocumento: remetenteDados.documento,
        remetenteTelefone: remetenteDados.telefone,
        remetenteEndereco: remetenteDados.endereco,
        remetenteVinculo: dados.remetenteTipo === 'membro_equipe' ? remetenteDados.vinculo : undefined,
        
        destinatarioNome: cliente?.nome || '',
        destinatarioDocumento: cliente?.documento || '',
        destinatarioTelefone: cliente?.telefone || '',
        destinatarioEndereco: typeof cliente?.endereco === 'string' ? cliente.endereco : '',
        
        transportadoraNome: materiaisData[0].transportadora,
        
        materiais: materiaisData.map(m => ({
          serial: m.serial || 'N/A',
          nome: m.nome,
          valorDeclarado: dados.valoresDeclarados[m.id] || 0,
        })),
        
        eventoNome: evento.nome,
        eventoLocal: `${evento.local}, ${evento.endereco}, ${evento.cidade}`,
        eventoData: new Date(evento.data_inicio).toLocaleDateString('pt-BR'),
        eventoHora: evento.hora_inicio,
        observacoes: dados.observacoes,
      };

      const pdfBlob = await gerarPDF(dadosDeclaracao);

      // Upload do PDF
      const fileName = `declaracao-transporte-${eventoId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documentos-transporte')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos-transporte')
        .getPublicUrl(fileName);

      // Atualizar registros
      const updates = dados.alocacaoIds.map(async (id) => {
        return supabase
          .from('eventos_materiais_alocados')
          .update({
            declaracao_transporte_url: publicUrl,
            valor_declarado: dados.valoresDeclarados[id] || 0,
            remetente_tipo: dados.remetenteTipo,
            remetente_membro_id: dados.remetenteMembroId,
            remetente_dados: remetenteDados,
            dados_destinatario: cliente,
            observacoes_transporte: dados.observacoes,
          })
          .eq('id', id);
      });

      await Promise.all(updates);

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Declaração de transporte gerada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao gerar declaração:', error);
      toast.error(`Erro ao gerar declaração: ${error.message || 'Erro desconhecido'}`);
    },
  });

  return {
    materiaisAlocados: materiaisData || [],
    loading: isLoading,
    alocarMaterial,
    alocarMaterialLote,
    registrarDevolucao,
    removerMaterialAlocado,
    registrarRetirada,
    gerarDeclaracaoTransporte,
  };
}