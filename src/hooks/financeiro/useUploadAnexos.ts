import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AnexoFinanceiro } from '@/types/financeiro';
import { DatabaseError, getErrorMessage } from '@/types/utils';

export function useUploadAnexos() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploadMultiplos = async (files: File[]): Promise<AnexoFinanceiro[]> => {
    setUploading(true);
    const anexos: AnexoFinanceiro[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        
        // Validações
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede 5MB`);
          continue;
        }
        
        const tipoValido = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!tipoValido.includes(file.type)) {
          toast.error(`Tipo de arquivo ${file.type} não suportado`);
          continue;
        }
        
        // Upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('financeiro-anexos')
          .upload(filePath, file);
        
        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}: ${uploadError.message}`);
          continue;
        }
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('financeiro-anexos')
          .getPublicUrl(filePath);
        
        anexos.push({
          nome: file.name,
          url: publicUrl,
          tipo: file.type,
          tamanho: file.size,
          uploadEm: new Date().toISOString(),
        });
      }
      
      if (anexos.length > 0) {
        toast.success(`${anexos.length} arquivo(s) enviado(s) com sucesso!`);
      }
      
      return anexos;
    } catch (error) {
      const err = error as DatabaseError;
      toast.error('Erro no upload: ' + getErrorMessage(err));
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const deletarAnexo = async (url: string) => {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) return;
      
      const { error } = await supabase.storage
        .from('financeiro-anexos')
        .remove([fileName]);
      
      if (error) throw error;
      
      toast.success('Anexo removido com sucesso!');
    } catch (error) {
      const err = error as DatabaseError;
      toast.error('Erro ao remover anexo: ' + getErrorMessage(err));
    }
  };
  
  return {
    uploadMultiplos,
    deletarAnexo,
    uploading,
    progress,
  };
}
