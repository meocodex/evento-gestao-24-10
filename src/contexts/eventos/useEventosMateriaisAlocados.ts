import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { gerarTermoRetirada } from '@/utils/termoRetiradaPDF';
import { gerarDeclaracaoTransporte as gerarDeclaracaoPDF } from '@/utils/declaracaoTransportePDF';
import type { 
  DatabaseError, 
  EnderecoObject, 
  RawMaterialAlocadoFromDB, 
  AlocarMaterialData,
  DevolucaoUpdateData 
} from '@/types/utils';
import { toJson } from '@/types/utils';
import type { Database } from '@/integrations/supabase/types';

// Função auxiliar para formatar endereço de objeto para string
const formatarEndereco = (endereco: EnderecoObject | string | null | undefined): string => {
  if (!endereco || typeof endereco !== 'object') {
    return (endereco as string) || '';
  }
  const partes = [
    endereco.logradouro,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    `${endereco.cidade}/${endereco.estado}`,
    endereco.cep ? `CEP ${endereco.cep}` : ''
  ].filter(Boolean);
  return partes.join(', ');
};

// Função helper para transformar snake_case para camelCase
const transformarMaterial = (data: RawMaterialAlocadoFromDB) => ({
  ...data,
  itemId: data.item_id,
  eventoId: data.evento_id,
  tipoEnvio: data.tipo_envio,
  quantidadeAlocada: data.quantidade_alocada,
  statusDevolucao: data.status_devolucao,
  dataDevolucao: data.data_devolucao,
  responsavelDevolucao: data.responsavel_devolucao,
  observacoesDevolucao: data.observacoes_devolucao,
  fotosDevolucao: data.fotos_devolucao,
  termoRetiradaUrl: data.termo_retirada_url,
  declaracaoTransporteUrl: data.declaracao_transporte_url,
  retiradoPorNome: data.retirado_por_nome,
  retiradoPorDocumento: data.retirado_por_documento,
  retiradoPorTelefone: data.retirado_por_telefone,
  dataRetirada: data.data_retirada,
  envioId: data.envio_id,
  valorDeclarado: data.valor_declarado,
  remetenteTipo: data.remetente_tipo,
  remetenteMembroId: data.remetente_membro_id,
  remetenteDados: data.remetente_dados,
  dadosDestinatario: data.dados_destinatario,
  observacoesTransporte: data.observacoes_transporte,
});

// Helper para extrair mensagem de erro
const getErrorMessage = (error: DatabaseError): string => {
  return 'message' in error ? error.message : 'Erro desconhecido';
};

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
      return (data || []).map((item) => transformarMaterial(item as RawMaterialAlocadoFromDB));
    },
  });

  const alocarMaterial = useMutation({
    mutationFn: async (data: AlocarMaterialData) => {
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .insert([{ ...data, evento_id: eventoId } as Database['public']['Tables']['eventos_materiais_alocados']['Insert']]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast.success('Material alocado com sucesso!');
    },
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao alocar material: ${getErrorMessage(error)}`);
    },
  });

  const alocarMaterialLote = useMutation({
    mutationFn: async (dados: AlocarMaterialData[]) => {
      const inserts = dados.map(data => ({
        ...data,
        evento_id: eventoId,
      })) as Database['public']['Tables']['eventos_materiais_alocados']['Insert'][];
      
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
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast.success(`${count} ${count === 1 ? 'material alocado' : 'materiais alocados'} com sucesso!`);
    },
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao alocar materiais: ${getErrorMessage(error)}`);
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
      
      const updateData: DevolucaoUpdateData = {
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
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao registrar devolução: ${getErrorMessage(error)}`);
    },
  });

  const removerMaterialAlocado = useMutation({
    mutationFn: async (id: string) => {
      // 1️⃣ Buscar dados do material e evento
      const { data: material, error: fetchError } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (data_inicio, hora_inicio, status)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!material) throw new Error('Material não encontrado');

      // 2️⃣ Validações Frontend (primeira linha de defesa)
      const evento = material.eventos as { data_inicio: string; hora_inicio: string; status: string };
      const dataHoraEvento = new Date(`${evento.data_inicio}T${evento.hora_inicio}`);
      const agora = new Date();

      // Validação 1: Evento já iniciou?
      if (dataHoraEvento <= agora) {
        throw new Error('Não é possível remover materiais de eventos já iniciados');
      }

      // Validação 2: Está vinculado a frete?
      if (material.envio_id) {
        throw new Error('Não é possível remover material vinculado a frete. Remova o frete primeiro.');
      }

      // Validação 3: Já foi devolvido?
      if (material.status_devolucao !== 'pendente') {
        throw new Error('Não é possível remover material já devolvido');
      }

      // Validação 4: Status do evento permite remoção?
      if (!['em_negociacao', 'confirmado'].includes(evento.status)) {
        throw new Error('Não é possível remover materiais de eventos em andamento ou finalizados');
      }

      // 3️⃣ Chamar Edge Function para validação dupla (segurança backend)
      const { data: validacao, error: validacaoError } = await supabase.functions.invoke(
        'validar-remocao-material',
        {
          body: { alocacaoId: id }
        }
      );

      if (validacaoError) throw validacaoError;
      if (!validacao?.podeRemover) {
        throw new Error(validacao?.motivo || 'Não é possível remover este material');
      }

      // 4️⃣ Executar DELETE
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
    onError: (error: DatabaseError) => {
      toast.error(getErrorMessage(error) || 'Erro ao remover material');
    },
  });

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  const registrarRetirada = useMutation({
    mutationFn: async (dados: {
      alocacaoIds: string[];
      retiradoPorNome: string;
      retiradoPorDocumento: string;
      retiradoPorTelefone: string;
    }) => {
      const { gerarTermoRetirada, uploadTermoRetirada } = await import('@/utils/termoRetiradaPDF');
      
      // Buscar dados dos materiais e evento
      const { data: materiaisData, error: fetchError } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (nome, local, data_inicio, hora_inicio, endereco, cidade)
        `)
        .in('id', dados.alocacaoIds);
      

      if (fetchError) {
        throw fetchError;
      }
      if (!materiaisData || materiaisData.length === 0) {
        throw new Error('Materiais não encontrados');
      }

      const evento = materiaisData[0].eventos as { nome: string; local: string; data_inicio: string; hora_inicio: string; endereco: string; cidade: string };

      // Buscar configurações da empresa
      const { data: configEmpresa } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .maybeSingle();

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
        dadosEmpresa: {
          nome: configEmpresa?.nome || configEmpresa?.razao_social || 'Empresa',
          cnpj: configEmpresa?.cnpj || '',
          telefone: configEmpresa?.telefone || '',
          endereco: formatarEndereco(configEmpresa?.endereco as EnderecoObject | null),
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
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao gerar termo: ${getErrorMessage(error)}`);
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
      const { data: materiaisData, error: fetchError } = await supabase
        .from('eventos_materiais_alocados')
        .select(`
          *,
          eventos!inner (
            nome, local, data_inicio, hora_inicio, endereco, cidade,
            clientes!inner (nome, documento, telefone, endereco)
          )
        `)
        .in('id', dados.alocacaoIds);

      if (fetchError) {
        throw fetchError;
      }
      if (!materiaisData || materiaisData.length === 0) {
        throw new Error('Materiais não encontrados');
      }

      interface EventoWithCliente {
        nome: string;
        local: string;
        data_inicio: string;
        hora_inicio: string;
        endereco: string;
        cidade: string;
        clientes: {
          nome: string;
          documento: string;
          telefone: string;
          endereco: string | EnderecoObject;
        };
      }

      const evento = materiaisData[0].eventos as EventoWithCliente;
      const cliente = evento.clientes;

      // Buscar dados do remetente
      let remetenteDados: {
        tipo: 'empresa' | 'membro_equipe';
        nome: string;
        documento: string;
        telefone: string;
        endereco?: string;
        vinculo?: string;
      };
      
      if (dados.remetenteTipo === 'empresa') {
        const { data: user } = await supabase.auth.getUser();
        const { data: config } = await supabase
          .from('configuracoes_usuario')
          .select('empresa')
          .eq('user_id', user.user?.id)
          .single();
        
        const empresaConfig = config?.empresa as { nome?: string; cnpj?: string; telefone?: string; endereco?: EnderecoObject } | null;
        
        remetenteDados = {
          tipo: 'empresa' as const,
          nome: empresaConfig?.nome || 'Empresa',
          documento: empresaConfig?.cnpj || '',
          telefone: empresaConfig?.telefone || '',
          endereco: empresaConfig?.endereco?.logradouro || '',
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
            remetente_dados: toJson(remetenteDados),
            dados_destinatario: toJson(cliente),
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
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao gerar declaração: ${getErrorMessage(error)}`);
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

      interface EventoComCliente {
        nome: string;
        local: string;
        data_inicio: string;
        hora_inicio: string;
        endereco?: string;
        cidade?: string;
        clientes?: {
          nome?: string;
          documento?: string;
          cpf?: string;
          cnpj?: string;
          telefone?: string;
          endereco?: EnderecoObject;
        };
      }

      const evento = materialData.eventos as EventoComCliente;

      // 2. Buscar configurações da empresa
      const { data: configEmpresa } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .maybeSingle();

      const dadosEmpresa = {
        nome: configEmpresa?.nome || configEmpresa?.razao_social || 'Empresa',
        cnpj: configEmpresa?.cnpj || '',
        telefone: configEmpresa?.telefone || '',
        endereco: formatarEndereco(configEmpresa?.endereco as EnderecoObject | null),
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
          .from('equipe_operacional')
          .select('*')
          .eq('id', materialData.remetente_membro_id || '')
          .single();

        interface MembroOperacional {
          nome?: string;
          cpf?: string;
          telefone?: string;
          endereco?: EnderecoObject;
        }

        const membro = membroData as MembroOperacional | null;

        const dadosDeclaracao = {
          remetenteTipo: (materialData.remetente_tipo || 'empresa') as 'empresa' | 'membro_equipe',
          remetenteNome: materialData.remetente_tipo === 'membro' && membro
            ? membro.nome
            : dadosEmpresa.nome,
          remetenteDocumento: materialData.remetente_tipo === 'membro' && membro
            ? membro.cpf
            : dadosEmpresa.cnpj,
          remetenteCPF: materialData.remetente_tipo === 'membro' && membro
            ? membro.cpf
            : dadosEmpresa.cnpj,
          remetenteTelefone: materialData.remetente_tipo === 'membro' && membro
            ? membro.telefone
            : dadosEmpresa.telefone,
          remetenteEndereco: materialData.remetente_tipo === 'membro' && membro
            ? `${membro.endereco?.logradouro || ''}, ${membro.endereco?.numero || ''}`
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
    onError: () => {
      // Error handled silently - reimprint is optional
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
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao vincular frete: ${getErrorMessage(error)}`);
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
