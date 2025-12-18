import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage, isImageFile } from '@/lib/imageOptimization';
import { 
  DatabaseError, 
  getErrorMessage,
  TipoArquivoEvento,
  EventoArquivosFromDB,
  EventoArquivoUpdateData
} from '@/types/utils';

export function useEventosArquivos() {
  const queryClient = useQueryClient();

  const uploadArquivo = useMutation({
    mutationFn: async ({ 
      eventoId, 
      tipo, 
      arquivo 
    }: { 
      eventoId: string; 
      tipo: TipoArquivoEvento;
      arquivo: File 
    }) => {
      let fileToUpload = arquivo;
      
      // Otimizar imagens automaticamente
      if (isImageFile(arquivo) && tipo === 'fotosEvento') {
        try {
          const { optimizedFile } = await optimizeImage(arquivo);
          fileToUpload = optimizedFile;
        } catch {
          // Falha na otimização, usar arquivo original
        }
      }
      
      // 1. Upload para Supabase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${fileToUpload.name}`;
      const filePath = `${eventoId}/${tipo}/${fileName}`;

      const { error: uploadError } = await supabase.storage
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

      const eventoArquivos = evento as EventoArquivosFromDB;
      const updateData: EventoArquivoUpdateData = {};

      if (tipo === 'plantaBaixa') {
        updateData.planta_baixa = publicUrl;
      } else if (tipo === 'documentos') {
        const documentosAtuais = eventoArquivos.documentos || [];
        updateData.documentos = [...documentosAtuais, publicUrl];
      } else if (tipo === 'fotosEvento') {
        const fotosAtuais = eventoArquivos.fotos_evento || [];
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
      
      const tipoNome: Record<TipoArquivoEvento, string> = {
        plantaBaixa: 'Planta baixa',
        documentos: 'Documento',
        fotosEvento: 'Foto'
      };

      toast.success('Upload concluído!', {
        description: `${tipoNome[variables.tipo]} enviado com sucesso.`
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro no upload', {
        description: getErrorMessage(error)
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
      tipo: TipoArquivoEvento;
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

      const eventoArquivos = evento as EventoArquivosFromDB;
      const updateData: EventoArquivoUpdateData = {};

      if (tipo === 'plantaBaixa') {
        updateData.planta_baixa = null;
      } else if (tipo === 'documentos') {
        const documentosAtuais = eventoArquivos.documentos || [];
        updateData.documentos = documentosAtuais.filter((doc) => doc !== url);
      } else if (tipo === 'fotosEvento') {
        const fotosAtuais = eventoArquivos.fotos_evento || [];
        updateData.fotos_evento = fotosAtuais.filter((foto) => foto !== url);
      }

      const { error: updateError } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventoId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Arquivo removido!', {
        description: 'Arquivo excluído com sucesso.'
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao remover arquivo', {
        description: getErrorMessage(error)
      });
    }
  });

  return {
    uploadArquivo,
    removerArquivo
  };
}
