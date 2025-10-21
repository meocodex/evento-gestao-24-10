import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { optimizeImage, isImageFile } from '@/lib/imageOptimization';

export function useEventosArquivos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadArquivo = useMutation({
    mutationFn: async ({ 
      eventoId, 
      tipo, 
      arquivo 
    }: { 
      eventoId: string; 
      tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento';
      arquivo: File 
    }) => {
      let fileToUpload = arquivo;
      
      // Otimizar imagens automaticamente
      if (isImageFile(arquivo) && tipo === 'fotosEvento') {
        console.log('🖼️ Otimizando imagem para WebP...');
        try {
          const { optimizedFile } = await optimizeImage(arquivo);
          fileToUpload = optimizedFile;
          console.log('✅ Imagem otimizada:', {
            original: `${(arquivo.size / 1024).toFixed(2)} KB`,
            optimized: `${(optimizedFile.size / 1024).toFixed(2)} KB`,
            reduction: `${(((arquivo.size - optimizedFile.size) / arquivo.size) * 100).toFixed(1)}%`
          });
        } catch (error) {
          console.warn('⚠️ Falha na otimização, usando arquivo original:', error);
        }
      }
      
      // 1. Upload para Supabase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${fileToUpload.name}`;
      const filePath = `${eventoId}/${tipo}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('eventos')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('eventos')
        .getPublicUrl(filePath);

      // 3. Atualizar tabela eventos com a URL
      const { data: evento, error: fetchError } = await supabase
        .from('eventos')
        .select('planta_baixa, documentos, fotos_evento')
        .eq('id', eventoId)
        .single();

      if (fetchError) throw fetchError;

      let updateData: any = {};

      if (tipo === 'plantaBaixa') {
        updateData.planta_baixa = publicUrl;
      } else if (tipo === 'documentos') {
        const documentosAtuais = evento.documentos || [];
        updateData.documentos = [...documentosAtuais, publicUrl];
      } else if (tipo === 'fotosEvento') {
        const fotosAtuais = evento.fotos_evento || [];
        updateData.fotos_evento = [...fotosAtuais, publicUrl];
      }

      const { error: updateError } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventoId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      
      const tipoNome = {
        plantaBaixa: 'Planta baixa',
        documentos: 'Documento',
        fotosEvento: 'Foto'
      }[variables.tipo];

      toast({
        title: 'Upload concluído!',
        description: `${tipoNome} enviado com sucesso.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerArquivo = useMutation({
    mutationFn: async ({ 
      eventoId, 
      tipo, 
      url 
    }: { 
      eventoId: string; 
      tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento';
      url: string 
    }) => {
      // 1. Extrair path do arquivo da URL
      const urlParts = url.split('/eventos/');
      const filePath = urlParts[1];

      // 2. Remover do Storage
      const { error: deleteError } = await supabase.storage
        .from('eventos')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // 3. Atualizar tabela eventos
      const { data: evento, error: fetchError } = await supabase
        .from('eventos')
        .select('planta_baixa, documentos, fotos_evento')
        .eq('id', eventoId)
        .single();

      if (fetchError) throw fetchError;

      let updateData: any = {};

      if (tipo === 'plantaBaixa') {
        updateData.planta_baixa = null;
      } else if (tipo === 'documentos') {
        const documentosAtuais = evento.documentos || [];
        updateData.documentos = documentosAtuais.filter((doc: string) => doc !== url);
      } else if (tipo === 'fotosEvento') {
        const fotosAtuais = evento.fotos_evento || [];
        updateData.fotos_evento = fotosAtuais.filter((foto: string) => foto !== url);
      }

      const { error: updateError } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventoId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Arquivo removido!',
        description: 'Arquivo excluído com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover arquivo',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    uploadArquivo,
    removerArquivo
  };
}
