import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { gerarTermoRetirada } from '@/utils/termoRetiradaPDF';
import { gerarDeclaracaoTransporte as gerarDeclaracaoPDF } from '@/utils/declaracaoTransportePDF';

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
    mutationFn: async ({ alocacaoId, statusDevolucao, observacoes, fotos, quantidadeDevolvida }: {
      alocacaoId: string;
      statusDevolucao: string;
      observacoes: string;
      fotos?: string[];
      quantidadeDevolvida?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const updateData: any = {
        status_devolucao: statusDevolucao,
        data_devolucao: new Date().toISOString(),
        responsavel_devolucao: user.user?.id,
        observacoes_devolucao: observacoes,
        fotos_devolucao: fotos,
      };
      
      // Adicionar quantidade devolvida se fornecida (materiais por quantidade)
      if (quantidadeDevolvida !== undefined) {
        updateData.quantidade_devolvida = quantidadeDevolvida;
      }
      
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .update(updateData)
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

  // Mutation para reimprimir documento
  const reimprimirDocumento = useMutation({
    mutationFn: async ({ 
      materialId, 
      tipoDocumento 
    }: { 
      materialId: string; 
      tipoDocumento: 'termo' | 'declaracao';
    }) => {
      // 1. Buscar dados do material
      const { data: materialData, error: fetchError } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (
            *,
            clientes:cliente_id (*)
          )
        `)
        .eq('id', materialId)
        .single();

      if (fetchError || !materialData) {
        throw new Error('Material não encontrado');
      }

      const evento = materialData.eventos;

      // 2. Buscar configurações da empresa
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: config } = await supabase
        .from('configuracoes_usuario')
        .select('empresa')
        .eq('user_id', user.id)
        .single();

      const dadosEmpresa = config?.empresa || {
        nome: 'Empresa',
        cnpj: '',
        telefone: '',
        endereco: '',
      };

      let pdfBlob: Blob;
      let fileName: string;
      let urlColumn: string;

      if (tipoDocumento === 'termo') {
        // Gerar Termo de Retirada
        const dadosRetirada = {
          retiradoPorNome: materialData.retirado_por_nome || '',
          retiradoPorDocumento: materialData.retirado_por_documento || '',
          retiradoPorTelefone: materialData.retirado_por_telefone || '',
          materiais: [{
            serial: materialData.serial,
            nome: materialData.nome,
            localizacao: 'Estoque',
            valorDeclarado: materialData.valor_declarado,
          }],
          eventoNome: evento.nome,
          eventoLocal: `${evento.local}, ${evento.endereco || ''}, ${evento.cidade || ''}`,
          eventoData: new Date(evento.data_inicio).toLocaleDateString('pt-BR'),
          eventoHora: evento.hora_inicio || '',
          dadosEmpresa,
        };

        pdfBlob = await gerarTermoRetirada(dadosRetirada);
        fileName = `termo-retirada-${eventoId}-${materialId}-${Date.now()}.pdf`;
        urlColumn = 'termo_retirada_url';
      } else {
        // Gerar Declaração de Transporte
        const { data: membroData } = await supabase
          .from('operacionais')
          .select('*')
          .eq('id', materialData.remetente_membro_id || '')
          .single();

        const dadosDeclaracao = {
          remetenteTipo: materialData.remetente_tipo || 'empresa',
          remetenteNome: materialData.remetente_tipo === 'membro' && membroData
            ? membroData.nome
            : dadosEmpresa.nome,
          remetenteDocumento: materialData.remetente_tipo === 'membro' && membroData
            ? membroData.cpf
            : dadosEmpresa.cnpj,
          remetenteCPF: materialData.remetente_tipo === 'membro' && membroData
            ? membroData.cpf
            : dadosEmpresa.cnpj,
          remetenteTelefone: materialData.remetente_tipo === 'membro' && membroData
            ? membroData.telefone
            : dadosEmpresa.telefone,
          remetenteEndereco: materialData.remetente_tipo === 'membro' && membroData
            ? `${membroData.endereco?.logradouro || ''}, ${membroData.endereco?.numero || ''}`
            : dadosEmpresa.endereco,
          destinatarioNome: evento.clientes?.nome || '',
          destinatarioDocumento: evento.clientes?.cpf || evento.clientes?.cnpj || '',
          destinatarioCPF: evento.clientes?.cpf || evento.clientes?.cnpj || '',
          destinatarioTelefone: evento.clientes?.telefone || '',
          destinatarioEndereco: `${evento.clientes?.endereco?.logradouro || ''}, ${evento.clientes?.endereco?.numero || ''}`,
          transportadoraNome: materialData.transportadora || '',
          eventoNome: evento.nome,
          eventoLocal: `${evento.local}, ${evento.endereco || ''}, ${evento.cidade || ''}`,
          eventoData: new Date(evento.data_inicio).toLocaleDateString('pt-BR'),
          eventoHora: evento.hora_inicio || '',
          materiais: [{
            serial: materialData.serial,
            nome: materialData.nome,
            valorDeclarado: materialData.valor_declarado || 0,
          }],
          observacoes: '',
        };

        pdfBlob = await gerarDeclaracaoPDF(dadosDeclaracao);
        fileName = `declaracao-transporte-${eventoId}-${materialId}-${Date.now()}.pdf`;
        urlColumn = 'declaracao_transporte_url';
      }

      // 3. Deletar arquivo antigo (opcional)
      const urlAntiga = tipoDocumento === 'termo' 
        ? materialData.termo_retirada_url 
        : materialData.declaracao_transporte_url;
      
      if (urlAntiga) {
        const oldFileName = urlAntiga.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('documentos-transporte')
            .remove([oldFileName]);
        }
      }

      // 4. Upload do novo PDF
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

      // 5. Atualizar URL no banco
      const { error: updateError } = await supabase
        .from('eventos_materiais_alocados')
        .update({ [urlColumn]: publicUrl })
        .eq('id', materialId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
    },
    onError: (error: any) => {
      console.error('Erro ao reimprimir documento:', error);
    },
  });

  const vincularMaterialesAFrete = useMutation({
    mutationFn: async (dados: {
      materialIds: string[];
      transportadoraId: string;
      transportadoraNome: string;
      dadosEnvio: {
        origem: string;
        destino: string;
        dataEntregaPrevista: string;
        valor: number;
        formaPagamento: 'antecipado' | 'na_entrega' | 'a_combinar';
        observacoes?: string;
      };
    }) => {
      // 1. Criar registro em 'envios'
      const { data: novoEnvio, error: envioError } = await supabase
        .from('envios')
        .insert({
          evento_id: eventoId,
          transportadora_id: dados.transportadoraId,
          tipo: 'ida',
          status: 'pendente',
          origem: dados.dadosEnvio.origem,
          destino: dados.dadosEnvio.destino,
          data_entrega_prevista: dados.dadosEnvio.dataEntregaPrevista,
          valor: dados.dadosEnvio.valor,
          forma_pagamento: dados.dadosEnvio.formaPagamento,
          observacoes: dados.dadosEnvio.observacoes,
        })
        .select()
        .single();
      
      if (envioError) throw envioError;
      
      // 2. Atualizar materiais alocados com envio_id e transportadora
      const { error: updateError } = await supabase
        .from('eventos_materiais_alocados')
        .update({
          envio_id: novoEnvio.id,
          transportadora: dados.transportadoraNome,
        })
        .in('id', dados.materialIds);
      
      if (updateError) throw updateError;
      
      return novoEnvio;
    },
    onSuccess: (envio, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['envios'] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success(`Frete criado! ${variables.materialIds.length} materiais vinculados.`);
    },
    onError: (error: any) => {
      console.error('Erro ao vincular frete:', error);
      toast.error(`Erro ao vincular frete: ${error.message}`);
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
    reimprimirDocumento,
    vincularMaterialesAFrete,
  };
}