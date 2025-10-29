import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
            const urlParts = anexo.url.split('/');
            const filePath = urlParts.slice(-2).join('/'); // demandaId/filename
            
            const { data: signedData, error: signedError } = await supabase.storage
              .from('demandas')
              .createSignedUrl(filePath, 3600); // 1 hora
            
            if (signedError) {
              console.error('Erro ao gerar URL assinada:', signedError);
              return anexo;
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

      // Obter URL assinada (válida por 1 hora)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('demandas')
        .createSignedUrl(filePath, 3600);

      if (signedError) throw signedError;

      const publicUrl = signedData?.signedUrl || '';

      // Criar registro no banco
      const { error: dbError } = await supabase
        .from('demandas_anexos')
        .insert({
          demanda_id: demandaId,
          nome: arquivo.name,
          tipo: arquivo.type,
          tamanho: arquivo.size,
          url: publicUrl,
          upload_por: uploadPor,
        });

      if (dbError) throw dbError;

      return publicUrl;
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
      // Extrair path do Storage da URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // demandaId/filename

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
