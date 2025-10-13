import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsuarios, Usuario } from "@/hooks/useUsuarios";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditarFuncaoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

export function EditarFuncaoUsuarioDialog({ open, onOpenChange, usuario }: EditarFuncaoUsuarioDialogProps) {
  const [novaRole, setNovaRole] = useState<"admin" | "comercial" | "suporte">("comercial");
  const { alterarFuncao } = useUsuarios();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNovaRole(usuario.role);
    }
  }, [usuario]);

  useEffect(() => {
    // Mostrar aviso se estiver mudando de admin para outra role
    if (usuario?.role === 'admin' && novaRole !== 'admin') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [novaRole, usuario?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    await alterarFuncao.mutateAsync({
      userId: usuario.id,
      newRole: novaRole,
    });
    onOpenChange(false);
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Função do Usuário</DialogTitle>
            <DialogDescription>
              Altere a função de {usuario.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {showWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Atenção! Você está removendo privilégios de administrador. Esta ação pode impedir o acesso a recursos críticos.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Nova Função</Label>
              <Select value={novaRole} onValueChange={(value: any) => setNovaRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Função atual: <strong>{usuario.role === 'admin' ? 'Administrador' : usuario.role === 'comercial' ? 'Comercial' : 'Suporte'}</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={alterarFuncao.isPending || novaRole === usuario.role}
              variant={showWarning ? "destructive" : "default"}
            >
              {alterarFuncao.isPending ? "Alterando..." : "Confirmar Alteração"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
