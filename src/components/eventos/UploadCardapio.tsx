import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadCardapioProps {
  eventoId?: string;
  cardapioAtual?: string;
  cardapioTipo?: string;
  onUploadComplete: (url: string, tipo: string) => void;
  onRemove: () => void;
}

export function UploadCardapio({ 
  eventoId, 
  cardapioAtual, 
  cardapioTipo,
  onUploadComplete, 
  onRemove 
}: UploadCardapioProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [cardapioUrl, setCardapioUrl] = useState(cardapioAtual || '');
  const [activeTab, setActiveTab] = useState(cardapioTipo === 'link' ? 'link' : 'upload');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, envie um PDF, Word ou imagem.',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventoId || Date.now()}-${Date.now()}.${fileExt}`;
      const filePath = `cardapios/${eventoId || 'temp'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('eventos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('eventos')
        .getPublicUrl(filePath);

      let tipo = 'pdf';
      if (file.type.includes('word')) tipo = 'word';
      else if (file.type.includes('image')) tipo = 'imagem';

      onUploadComplete(publicUrl, tipo);

      toast({
        title: 'Cardápio enviado!',
        description: 'O arquivo foi enviado com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar arquivo',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = () => {
    if (!cardapioUrl.trim()) {
      toast({
        title: 'Link inválido',
        description: 'Por favor, insira um link válido.',
        variant: 'destructive'
      });
      return;
    }

    onUploadComplete(cardapioUrl, 'link');

    toast({
      title: 'Link salvo!',
      description: 'O link do cardápio foi salvo com sucesso.'
    });
  };

  const getNomeTipo = (tipo?: string) => {
    switch (tipo) {
      case 'pdf': return 'PDF';
      case 'word': return 'Word';
      case 'imagem': return 'Imagem';
      case 'link': return 'Link Externo';
      default: return 'Arquivo';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Cardápio do Evento</Label>
      
      {cardapioAtual ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <FileText className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{getNomeTipo(cardapioTipo)}</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {cardapioAtual}
            </p>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onRemove}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Externo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-2">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input 
                type="file" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PDF, Word ou Imagem (máx. 10MB)
              </p>
              {uploading && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Enviando...</span>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-2">
            <div className="flex gap-2">
              <Input 
                placeholder="https://exemplo.com/cardapio.pdf"
                value={cardapioUrl}
                onChange={(e) => setCardapioUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLinkSubmit()}
              />
              <Button onClick={handleLinkSubmit}>
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole o link do cardápio hospedado externamente
            </p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
