import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function ConfiguracaoFechamento() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [papelTimbrado, setPapelTimbrado] = useState<string | undefined>();

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuracao-fechamento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_fechamento')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPapelTimbrado(data.papel_timbrado);
      }
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `papel-timbrado/default.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contratos')
        .getPublicUrl(path);

      return urlData.publicUrl;
    },
    onSuccess: (url) => {
      setPapelTimbrado(url);
      toast({ title: 'Upload realizado', description: 'Papel timbrado carregado.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    },
  });

  const salvarMutation = useMutation({
    mutationFn: async (papelTimbradoUrl: string) => {
      if (config?.id) {
        const { error } = await supabase
          .from('configuracoes_fechamento')
          .update({ papel_timbrado: papelTimbradoUrl, updated_at: new Date().toISOString() })
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_fechamento')
          .insert({ papel_timbrado: papelTimbradoUrl });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracao-fechamento'] });
      toast({ title: 'Configuração salva', description: 'Papel timbrado configurado com sucesso.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) uploadMutation.mutate(files[0]);
    },
  });

  const handleSalvar = () => {
    if (!papelTimbrado) {
      toast({ title: 'Papel timbrado necessário', description: 'Faça upload antes de salvar.', variant: 'destructive' });
      return;
    }
    salvarMutation.mutate(papelTimbrado);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Fechamento</CardTitle>
        <CardDescription>
          Configure o papel timbrado usado nos relatórios de fechamento de eventos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload área */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Arraste uma imagem ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground">PNG ou JPG — será usado como fundo A4</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {papelTimbrado && (
          <div className="relative group">
            <img
              src={papelTimbrado}
              alt="Papel timbrado"
              className="w-full rounded-lg border object-contain max-h-48"
            />
            <button
              onClick={() => setPapelTimbrado(undefined)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {!papelTimbrado && config?.papel_timbrado && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Papel timbrado configurado anteriormente</span>
            <Button variant="ghost" size="sm" onClick={() => setPapelTimbrado(config.papel_timbrado)}>
              Manter
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSalvar} disabled={!papelTimbrado || salvarMutation.isPending}>
            {salvarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
