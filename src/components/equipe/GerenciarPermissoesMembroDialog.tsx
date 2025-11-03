import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';
import { Loader2, Lightbulb } from 'lucide-react';

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
      const [
        { data: up }, 
        { data: roleData },
        { data: allPerms }
      ] = await Promise.all([
        supabase
          .from('user_permissions')
          .select('permission_id')
          .eq('user_id', membro!.id),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', membro!.id)
          .single(),
        supabase
          .from('permissions')
          .select('id')
      ]);
      
      const selectedPerms = up?.map(p => p.permission_id) || [];
      const isAdmin = roleData?.role === 'admin';
      const totalPerms = allPerms?.map(p => p.id) || [];
      
      console.log('🔍 GerenciarPermissoesMembro carregou:', {
        membroId: membro!.id,
        membroNome: membro!.nome,
        isAdmin,
        selectedCount: selectedPerms.length,
        totalCount: totalPerms.length
      });
      
      // Se admin e permissões não batem, forçar todas
      if (isAdmin && selectedPerms.length < totalPerms.length) {
        return { permissions: totalPerms, role: 'admin' };
      }
      
      return { permissions: selectedPerms, role: roleData?.role || 'comercial' };
    }
  });

  // Atualizar estado quando carregar
  useEffect(() => {
    if (open && membroPermsData) {
      setPermissoesSelecionadas(membroPermsData.permissions);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Gerenciar Permissões ({permissoesSelecionadas.length}/56)
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Editando permissões de: <strong>{membro?.nome}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                Sugestões por Função
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <strong className="text-blue-900 dark:text-blue-300">🎯 Comercial:</strong>
                <p className="text-blue-700 dark:text-blue-400 ml-4">
                  eventos (criar, visualizar, editar próprios), clientes, contratos, financeiro (próprios)
                </p>
              </div>
              <div>
                <strong className="text-purple-900 dark:text-purple-300">🔧 Suporte:</strong>
                <p className="text-purple-700 dark:text-purple-400 ml-4">
                  estoque (completo), transportadoras, demandas, equipe, eventos (visualizar)
                </p>
              </div>
              <div>
                <strong className="text-green-900 dark:text-green-300">👷 Operacional:</strong>
                <p className="text-green-700 dark:text-green-400 ml-4">
                  eventos (visualizar), estoque (visualizar), demandas (criar)
                </p>
              </div>
            </CardContent>
          </Card>

          <GerenciarPermissoes
            userId={membro?.id || ''}
            userPermissions={permissoesSelecionadas}
            onPermissionsChange={setPermissoesSelecionadas}
          />
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