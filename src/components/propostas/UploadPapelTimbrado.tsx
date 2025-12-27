import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadPapelTimbradoProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function UploadPapelTimbrado({ value, onChange }: UploadPapelTimbradoProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo - APENAS IMAGENS (PDF não é suportado pelo jsPDF addImage)
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, envie uma IMAGEM no formato PNG ou JPG. PDFs não são suportados.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreview(url);
      onChange(url);
      toast({
        title: 'Papel timbrado carregado',
        description: 'A imagem foi carregada com sucesso.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Papel Timbrado (A4 - Opcional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Envie uma imagem em formato A4 (210x297mm) para usar como fundo nos documentos.
        </p>
      </div>

      {preview ? (
        <div className="relative border rounded-lg p-4 bg-muted/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-32 h-44 border rounded bg-background overflow-hidden">
              <img 
                src={preview} 
                alt="Preview do papel timbrado" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileImage className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Papel timbrado carregado</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta imagem será usada como fundo em todos os documentos gerados com este template.
              </p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste um arquivo ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            PNG ou JPG (máx. 5MB) - PDFs não são suportados
          </p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => inputRef.current?.click()}
          >
            Selecionar Arquivo
          </Button>
        </div>
      )}
    </div>
  );
}