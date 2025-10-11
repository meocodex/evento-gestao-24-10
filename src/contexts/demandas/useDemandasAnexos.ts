import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDemandasAnexos() {
  const queryClient = useQueryClient();

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

      const { error: uploadError } = await supabase.storage
        .from('demandas')
        .upload(filePath, arquivo);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('demandas')
        .getPublicUrl(filePath);

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
    adicionarAnexo,
    removerAnexo,
  };
}
