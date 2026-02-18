import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContratoEvento, StatusContratoEvento, TipoContratoEvento } from '@/types/evento-contratos';
import { toast } from 'sonner';

type EventoContratoDB = {
  id: string;
  evento_id: string;
  tipo: string;
  titulo: string;
  conteudo: string;
  status: string;
  arquivo_assinado_url: string | null;
  arquivo_assinado_nome: string | null;
  created_at: string;
  updated_at: string;
};

function transformContrato(raw: EventoContratoDB): ContratoEvento {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    tipo: raw.tipo as TipoContratoEvento,
    titulo: raw.titulo,
    conteudo: raw.conteudo,
    status: raw.status as StatusContratoEvento,
    arquivoAssinadoUrl: raw.arquivo_assinado_url,
    arquivoAssinadoNome: raw.arquivo_assinado_nome,
    criadoEm: raw.created_at,
    atualizadoEm: raw.updated_at,
  };
}

// Tipo auxiliar para contornar a ausência de eventos_contratos nos tipos gerados
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

export function useEventoContratos(eventoId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['eventos-contratos', eventoId];

  const { data: contratos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<ContratoEvento[]> => {
      const { data, error } = await supabaseAny
        .from('eventos_contratos')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data || []) as EventoContratoDB[]).map(transformContrato);
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5,
  });

  const criarContrato = useMutation({
    mutationFn: async (dados: { tipo: TipoContratoEvento; titulo: string; conteudo: string }) => {
      const { data, error } = await supabaseAny
        .from('eventos_contratos')
        .insert({
          evento_id: eventoId,
          tipo: dados.tipo,
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          status: 'rascunho',
        })
        .select()
        .single();

      if (error) throw error;
      return transformContrato(data as EventoContratoDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Contrato criado com sucesso');
    },
    onError: (err: Error) => {
      toast.error('Erro ao criar contrato: ' + err.message);
    },
  });

  const editarContrato = useMutation({
    mutationFn: async (dados: { id: string; conteudo: string }) => {
      const { error } = await supabaseAny
        .from('eventos_contratos')
        .update({ conteudo: dados.conteudo })
        .eq('id', dados.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error('Erro ao salvar: ' + err.message);
    },
  });

  const finalizarContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAny
        .from('eventos_contratos')
        .update({ status: 'finalizado' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Contrato finalizado');
    },
    onError: (err: Error) => {
      toast.error('Erro ao finalizar: ' + err.message);
    },
  });

  const excluirContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAny
        .from('eventos_contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Contrato excluído');
    },
    onError: (err: Error) => {
      toast.error('Erro ao excluir: ' + err.message);
    },
  });

  const uploadArquivoAssinado = useMutation({
    mutationFn: async ({ id, arquivo }: { id: string; arquivo: File }) => {
      const ext = arquivo.name.split('.').pop() ?? 'pdf';
      const path = `${eventoId}/${id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(path, arquivo, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contratos')
        .getPublicUrl(path);

      const { error: updateError } = await supabaseAny
        .from('eventos_contratos')
        .update({
          arquivo_assinado_url: urlData.publicUrl,
          arquivo_assinado_nome: arquivo.name,
        })
        .eq('id', id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Arquivo anexado com sucesso');
    },
    onError: (err: Error) => {
      toast.error('Erro ao anexar arquivo: ' + err.message);
    },
  });

  return {
    contratos,
    isLoading,
    criarContrato,
    editarContrato,
    finalizarContrato,
    excluirContrato,
    uploadArquivoAssinado,
  };
}
