import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';
import { Loader2, ChevronDown } from 'lucide-react';

interface GerenciarPermissoesMembroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro: MembroEquipeUnificado | null;
}

export function GerenciarPermissoesMembroDialog({ open, onOpenChange, membro }: GerenciarPermissoesMembroDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Query dedicada que carrega permissões on dialog open
  const { data: membroPermsData, isLoading: loadingPerms } = useQuery({
    queryKey: ['membro_permissions_dialog', membro?.id, open],
    enabled: open && !!membro?.id,
    queryFn: async () => {
      const { data: up } = await supabase
        .from('user_permissions')
        .select('permission_id')
        .eq('user_id', membro!.id);
      
      const selectedPerms = up?.map(p => p.permission_id) || [];
      
      console.log('🔍 GerenciarPermissoesMembro carregou:', {
        membroId: membro!.id,
        membroNome: membro!.nome,
        selectedCount: selectedPerms.length
      });
      
      return selectedPerms;
    }
  });

  // Atualizar estado quando carregar
  useEffect(() => {
    if (open && membroPermsData) {
      setPermissoesSelecionadas(membroPermsData);
    }
  }, [open, membroPermsData]);

  const handleSubmit = async () => {
    if (!membro) return;

    try {
      setSalvando(true);

      // Deletar permissões antigas
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', membro.id);

      if (deleteError) throw deleteError;

      // Inserir novas permissões
      if (permissoesSelecionadas.length > 0) {
        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert(
            permissoesSelecionadas.map(permissionId => ({
              user_id: membro.id,
              permission_id: permissionId
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: 'Permissões atualizadas!',
        description: `${permissoesSelecionadas.length} permissões foram salvas para ${membro.nome}.`
      });

      queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar permissões',
        variant: 'destructive'
      });
    } finally {
      setSalvando(false);
    }
  };

  // Loading state
  if (loadingPerms) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">
              Carregando permissões de {membro?.nome}...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const progressPercentage = Math.round((permissoesSelecionadas.length / 56) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões - {membro?.nome}</DialogTitle>
          <DialogDescription>
            {permissoesSelecionadas.length} de 56 permissões ativas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium min-w-[3rem] text-right">
              {progressPercentage}%
            </span>
          </div>

          <GerenciarPermissoes
            userId={membro?.id || ''}
            userPermissions={permissoesSelecionadas}
            onPermissionsChange={setPermissoesSelecionadas}
          />

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs text-muted-foreground">💡 Ver sugestões por função</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Alert className="mt-2">
                <AlertDescription className="space-y-2 text-xs">
                  <div>
                    <strong className="text-foreground">🎯 Comercial:</strong>
                    <p className="text-muted-foreground ml-4">
                      eventos (criar, visualizar, editar próprios), clientes, contratos, financeiro (próprios)
                    </p>
                  </div>
                  <div>
                    <strong className="text-foreground">🔧 Suporte:</strong>
                    <p className="text-muted-foreground ml-4">
                      estoque (completo), transportadoras, demandas, equipe, eventos (visualizar)
                    </p>
                  </div>
                  <div>
                    <strong className="text-foreground">👷 Operacional:</strong>
                    <p className="text-muted-foreground ml-4">
                      eventos (visualizar), estoque (visualizar), demandas (criar)
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}