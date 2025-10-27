import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { TemplatesPermissoes } from '@/components/configuracoes/TemplatesPermissoes';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';
import { Loader2 } from 'lucide-react';

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

  const handleTemplateSelect = (permissions: string[]) => {
    setPermissoesSelecionadas(permissions);
  };

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
        description: `Permissões de ${membro.nome} foram atualizadas com sucesso.`
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
          <DialogTitle>Gerenciar Permissões</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Editando permissões de: <strong>{membro?.nome}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <TemplatesPermissoes onSelectTemplate={handleTemplateSelect} />
          <Separator />
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
