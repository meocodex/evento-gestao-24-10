import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Helper para extrair o caminho do storage de URLs antigas ou novas
function extractStoragePath(url: string): string {
  try {
    // Se já é um path simples (demandaId/filename)
    if (!url.includes('http') && !url.includes('storage') && !url.includes('sign')) {
      return url;
    }
    
    // Extrair de URL completa: .../demandas/PATH
    const match = url.match(/\/demandas\/(.+?)(\?|$)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
}

export function useDemandasAnexos(demandaId: string) {
  const queryClient = useQueryClient();

  // Query para buscar anexos
  const { data: anexos = [], isLoading } = useQuery({
    queryKey: ['demandas-anexos', demandaId],
    queryFn: async () => {
      if (!demandaId) return [];
      
      const { data, error } = await supabase
        .from('demandas_anexos')
        .select('*')
        .eq('demanda_id', demandaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Gerar URLs assinadas para cada anexo (válidas por 1 hora)
      const anexosComUrls = await Promise.all(
        (data || []).map(async (anexo) => {
          try {
            // Usar o caminho armazenado (já está limpo ou será extraído)
            const filePath = extractStoragePath(anexo.url);
            
            const { data: signedData, error: signedError } = await supabase.storage
              .from('demandas')
              .createSignedUrl(filePath, 3600); // 1 hora
            
            if (signedError) {
              console.error('Erro ao gerar URL assinada:', signedError);
              return {
                id: anexo.id,
                nome: anexo.nome,
                url: anexo.url,
                tipo: anexo.tipo,
                tamanho: anexo.tamanho,
                uploadPor: anexo.upload_por,
                uploadEm: anexo.created_at,
              };
            }
            
            return {
              id: anexo.id,
              nome: anexo.nome,
              url: signedData?.signedUrl || anexo.url,
              tipo: anexo.tipo,
              tamanho: anexo.tamanho,
              uploadPor: anexo.upload_por,
              uploadEm: anexo.created_at,
            };
          } catch (error) {
            console.error('Erro ao processar anexo:', error);
            return {
              id: anexo.id,
              nome: anexo.nome,
              url: anexo.url,
              tipo: anexo.tipo,
              tamanho: anexo.tamanho,
              uploadPor: anexo.upload_por,
              uploadEm: anexo.created_at,
            };
          }
        })
      );
      
      return anexosComUrls;
    },
    enabled: !!demandaId,
  });

  const adicionarAnexo = useMutation({
    mutationFn: async ({ 
      demandaId, 
      arquivo, 
      uploadPor 
    }: { 
      demandaId: string; 
      arquivo: File; 
      uploadPor: string;
    }) => {
      // Upload para Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${arquivo.name}`;
      const filePath = `${demandaId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('demandas')
        .upload(filePath, arquivo, {
          contentType: arquivo.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Criar registro no banco com PATH relativo (não URL completa)
      const { error: dbError } = await supabase
        .from('demandas_anexos')
        .insert({
          demanda_id: demandaId,
          nome: arquivo.name,
          tipo: arquivo.type,
          tamanho: arquivo.size,
          url: filePath, // Salvar apenas o path relativo
          upload_por: uploadPor,
        });

      if (dbError) throw dbError;

      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Anexo adicionado', description: 'O arquivo foi anexado à demanda.' });
    },
    onError: (error) => {
      console.error('Erro ao adicionar anexo:', error);
      toast({ title: 'Erro ao adicionar anexo', variant: 'destructive' });
    },
  });

  const removerAnexo = useMutation({
    mutationFn: async ({ demandaId, anexoId, url }: { demandaId: string; anexoId: string; url: string }) => {
      // Extrair path do Storage (compatível com URLs antigas e novas)
      const filePath = extractStoragePath(url);

      // Remover do Storage
      const { error: storageError } = await supabase.storage
        .from('demandas')
        .remove([filePath]);

      if (storageError) console.error('Erro ao remover do storage:', storageError);

      // Remover do banco
      const { error: dbError } = await supabase
        .from('demandas_anexos')
        .delete()
        .eq('id', anexoId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Anexo removido', description: 'O arquivo foi removido da demanda.' });
    },
    onError: (error) => {
      console.error('Erro ao remover anexo:', error);
      toast({ title: 'Erro ao remover anexo', variant: 'destructive' });
    },
  });

  return {
    anexos,
    isLoading,
    adicionarAnexo,
    removerAnexo,
  };
}
