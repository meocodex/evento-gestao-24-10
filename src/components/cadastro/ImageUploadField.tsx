import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  dimensions?: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  accept?: string[];
  maxSizeMB?: number;
  tempId: string; // ID temporário para organizar uploads antes de ter o protocolo
}

export function ImageUploadField({
  label,
  description,
  dimensions,
  value,
  onChange,
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5,
  tempId,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);

  const isPDF = accept.includes('application/pdf');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo deve ter no máximo ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Gerar nome único para o arquivo
      const ext = file.name.split('.').pop();
      const fileName = `${tempId}/${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cadastros-publicos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cadastros-publicos')
        .getPublicUrl(fileName);

      // Se for imagem, criar preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(undefined);
      }

      onChange(publicUrl);
      toast({
        title: 'Upload concluído',
        description: 'Arquivo enviado com sucesso!',
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [label, maxSizeMB, onChange, tempId]);

  const handleRemove = async () => {
    if (value) {
      try {
        // Extrair o caminho do arquivo da URL
        const url = new URL(value);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf('cadastros-publicos');
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from('cadastros-publicos').remove([filePath]);
        }
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }
    setPreview(undefined);
    onChange(undefined);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">(opcional)</span>
      </div>
      
      {dimensions && (
        <p className="text-xs text-muted-foreground">Dimensões recomendadas: {dimensions}</p>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value || preview ? (
        <div className="relative rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            {preview && !isPDF ? (
              <img 
                src={preview} 
                alt={label} 
                className="h-16 w-24 object-cover rounded border"
              />
            ) : isPDF ? (
              <div className="h-16 w-24 flex items-center justify-center bg-background rounded border">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <div className="h-16 w-24 flex items-center justify-center bg-background rounded border">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{label}</p>
              <p className="text-xs text-green-600">Arquivo enviado ✓</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative rounded-lg border-2 border-dashed p-4 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste ou clique para enviar'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPDF ? 'PDF ou imagem' : 'JPG, PNG ou WebP'} (máx. {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
