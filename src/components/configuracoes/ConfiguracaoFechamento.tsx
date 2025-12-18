import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UploadPapelTimbrado } from '@/components/propostas/UploadPapelTimbrado';
import { Loader2 } from 'lucide-react';

export function ConfiguracaoFechamento() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [papelTimbrado, setPapelTimbrado] = useState<string | undefined>();

  // Query para buscar configuração existente
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

  // Mutation para salvar configuração
  const salvarMutation = useMutation({
    mutationFn: async (papelTimbradoUrl: string) => {
      // Verificar se já existe configuração
      if (config?.id) {
        // Atualizar existente
        const { error } = await supabase
          .from('configuracoes_fechamento')
          .update({ 
            papel_timbrado: papelTimbradoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        // Criar nova
        const { error } = await supabase
          .from('configuracoes_fechamento')
          .insert({ papel_timbrado: papelTimbradoUrl });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracao-fechamento'] });
      toast({
        title: 'Configuração salva',
        description: 'O papel timbrado foi configurado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      });
    },
  });

  const handleSalvar = () => {
    if (!papelTimbrado) {
      toast({
        title: 'Papel timbrado necessário',
        description: 'Por favor, faça upload do papel timbrado antes de salvar.',
        variant: 'destructive',
      });
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
          Configure o papel timbrado que será usado nos relatórios de fechamento de eventos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UploadPapelTimbrado
          value={papelTimbrado}
          onChange={setPapelTimbrado}
        />

        <div className="flex justify-end">
          <Button 
            onClick={handleSalvar}
            disabled={!papelTimbrado || salvarMutation.isPending}
          >
            {salvarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
