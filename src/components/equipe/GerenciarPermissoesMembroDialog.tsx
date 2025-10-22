import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { TemplatesPermissoes } from '@/components/configuracoes/TemplatesPermissoes';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';

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

  useEffect(() => {
    if (membro?.permissions) {
      setPermissoesSelecionadas(membro.permissions);
    }
  }, [membro]);

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
