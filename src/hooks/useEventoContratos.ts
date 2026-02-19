import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DocumentoEvento } from '@/types/evento-contratos';
import { toast } from 'sonner';

type EventoContratoDB = {
  id: string;
  evento_id: string;
  titulo: string;
  arquivo_assinado_url: string | null;
  arquivo_assinado_nome: string | null;
  arquivo_tamanho: number | null;
  created_at: string;
};

function transformDocumento(raw: EventoContratoDB): DocumentoEvento {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    titulo: raw.titulo,
    arquivoUrl: raw.arquivo_assinado_url,
    arquivoNome: raw.arquivo_assinado_nome,
    arquivoTamanho: raw.arquivo_tamanho,
    criadoEm: raw.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

export function useEventoDocumentos(eventoId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['eventos-contratos', eventoId];

  const { data: documentos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<DocumentoEvento[]> => {
      const { data, error } = await supabaseAny
        .from('eventos_contratos')
        .select('id, evento_id, titulo, arquivo_assinado_url, arquivo_assinado_nome, arquivo_tamanho, created_at')
        .eq('evento_id', eventoId)
        .not('arquivo_assinado_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data || []) as EventoContratoDB[]).map(transformDocumento);
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5,
  });

  const adicionarDocumento = useMutation({
    mutationFn: async ({ titulo, arquivo }: { titulo: string; arquivo: File }) => {
      const timestamp = Date.now();
      const nomeArquivo = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${eventoId}/${timestamp}-${nomeArquivo}`;

      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(path, arquivo, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabaseAny
        .from('eventos_contratos')
        .insert({
          evento_id: eventoId,
          titulo,
          tipo: 'documento',
          conteudo: '',
          status: 'finalizado',
          arquivo_assinado_url: path,
          arquivo_assinado_nome: arquivo.name,
          arquivo_tamanho: arquivo.size,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Documento adicionado com sucesso');
    },
    onError: (err: Error) => {
      toast.error('Erro ao adicionar documento: ' + err.message);
    },
  });

  const removerDocumento = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from('contratos').remove([storagePath]);

      const { error } = await supabaseAny
        .from('eventos_contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Documento removido');
    },
    onError: (err: Error) => {
      toast.error('Erro ao remover documento: ' + err.message);
    },
  });

  const getSignedUrl = async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('contratos')
      .createSignedUrl(storagePath, 3600);

    if (error) throw error;
    return data.signedUrl;
  };

  return {
    documentos,
    isLoading,
    adicionarDocumento,
    removerDocumento,
    getSignedUrl,
  };
}

// Alias para retrocompatibilidade
export const useEventoContratos = useEventoDocumentos;
