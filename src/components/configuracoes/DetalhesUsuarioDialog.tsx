import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Usuario } from '@/hooks/useUsuarios';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';

interface DetalhesUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'comercial':
      return 'default';
    case 'suporte':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'comercial':
      return 'Comercial';
    case 'suporte':
      return 'Suporte/Operacional';
    default:
      return role;
  }
};

export function DetalhesUsuarioDialog({
  open,
  onOpenChange,
  usuario,
}: DetalhesUsuarioDialogProps) {
  if (!usuario) return null;

  const getInitials = (nome: string) => {
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={usuario.avatar_url || undefined} />
              <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{usuario.nome}</h3>
              <Badge variant={getRoleBadgeVariant(usuario.role)}>
                {getRoleLabel(usuario.role)}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{usuario.email}</p>
              </div>
            </div>

            {usuario.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{usuario.telefone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Função</p>
                <p className="font-medium">{getRoleLabel(usuario.role)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Membro desde</p>
                <p className="font-medium">
                  {usuario.created_at 
                    ? format(new Date(usuario.created_at), "dd/MM/yyyy 'às' HH:mm")
                    : 'Data não disponível'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
