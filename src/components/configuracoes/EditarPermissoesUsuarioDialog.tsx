import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { GerenciarPermissoes } from "./GerenciarPermissoes";
import { TemplatesPermissoes } from "./TemplatesPermissoes";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/hooks/useUsuarios";

interface EditarPermissoesUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario;
}

export function EditarPermissoesUsuarioDialog({ 
  open, 
  onOpenChange, 
  usuario 
}: EditarPermissoesUsuarioDialogProps) {
  if (!usuario) {
    return null;
  }

  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Buscar todas as permissões para o caso de Admin
  const { data: todasPermissoes = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await supabase.from('permissions').select('id');
      return data?.map(p => p.id) || [];
    },
  });

  useEffect(() => {
    if (open && usuario?.permissions) {
      setPermissoesSelecionadas(usuario.permissions);
    }
  }, [open, usuario?.id, usuario?.permissions]);

  const handleTemplateSelect = (permissions: string[]) => {
    // Se array vazio, significa Admin (todas permissões)
    if (permissions.length === 0) {
      setPermissoesSelecionadas(todasPermissoes);
    } else {
      setPermissoesSelecionadas(permissions);
    }
  };

  const salvarPermissoes = useMutation({
    mutationFn: async () => {
      // Deletar permissões antigas
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', usuario.id);

      if (deleteError) throw deleteError;

      // Inserir novas permissões
      if (permissoesSelecionadas.length > 0) {
        const permissionsData = permissoesSelecionadas.map(permission_id => ({
          user_id: usuario.id,
          permission_id,
        }));

        const { error: insertError } = await supabase
          .from('user_permissions')
          .insert(permissionsData);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Permissões atualizadas com sucesso!');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar permissões:', error);
      toast.error('Erro ao atualizar permissões: ' + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Permissões - {usuario.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="permissoes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <TemplatesPermissoes 
              onSelectTemplate={handleTemplateSelect}
              disabled={salvarPermissoes.isPending}
            />
          </TabsContent>

          <TabsContent value="permissoes">
            <GerenciarPermissoes
              userId={usuario.id}
              userPermissions={permissoesSelecionadas}
              onPermissionsChange={setPermissoesSelecionadas}
              disabled={salvarPermissoes.isPending}
            />
          </TabsContent>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => salvarPermissoes.mutate()}
              className="flex-1"
              disabled={salvarPermissoes.isPending || permissoesSelecionadas.length === 0}
            >
              {salvarPermissoes.isPending ? "Salvando..." : "Salvar Permissões"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
