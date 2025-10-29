import { useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { AnexoFinanceiro } from '@/types/financeiro';
import { useUploadAnexos } from '@/hooks/financeiro';

interface AnexosUploadProps {
  onAnexosChange: (anexos: AnexoFinanceiro[]) => void;
  anexosAtuais?: AnexoFinanceiro[];
  maxFiles?: number;
  maxSizeMB?: number;
}

export function AnexosUpload({
  onAnexosChange,
  anexosAtuais = [],
  maxFiles = 10,
  maxSizeMB = 5,
}: AnexosUploadProps) {
  const { uploadMultiplos, deletarAnexo, uploading, progress } = useUploadAnexos();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (anexosAtuais.length + acceptedFiles.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const novosAnexos = await uploadMultiplos(acceptedFiles);
    onAnexosChange([...anexosAtuais, ...novosAnexos]);
  }, [anexosAtuais, maxFiles, uploadMultiplos, onAnexosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removerAnexo = async (anexo: AnexoFinanceiro) => {
    await deletarAnexo(anexo.url);
    onAnexosChange(anexosAtuais.filter(a => a.url !== anexo.url));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? (
            'Solte os arquivos aqui...'
          ) : (
            <>
              Arraste arquivos ou <span className="text-primary font-medium">clique para selecionar</span>
              <br />
              <span className="text-xs">PDF, PNG, JPG (máx. {maxSizeMB}MB cada)</span>
            </>
          )}
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Enviando arquivos...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {anexosAtuais.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {anexosAtuais.map((anexo, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 border rounded-lg bg-card"
            >
              {anexo.tipo.startsWith('image/') ? (
                <ImageIcon className="h-8 w-8 text-primary flex-shrink-0" />
              ) : (
                <FileText className="h-8 w-8 text-destructive flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{anexo.nome}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(anexo.tamanho)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removerAnexo(anexo)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
