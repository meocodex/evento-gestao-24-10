import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Eye, MoreVertical, Shield } from "lucide-react";
import { useUsuarios, Usuario } from "@/hooks/useUsuarios";
import { EditarPermissoesUsuarioDialog } from "./EditarPermissoesUsuarioDialog";
import { DetalhesUsuarioDialog } from "./DetalhesUsuarioDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function getRoleBadgeVariant(role: string) {
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
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'comercial':
      return 'Comercial';
    case 'suporte':
      return 'Suporte';
    default:
      return role;
  }
}

export function GerenciarUsuarios() {
  const { usuarios, isLoading } = useUsuarios();
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null);
  const [detalhesUsuario, setDetalhesUsuario] = useState<Usuario | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>
                Visualize e gerencie as permissões dos usuários que já têm acesso ao sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios?.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={usuario.avatar_url} />
                          <AvatarFallback>
                            {usuario.nome
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{usuario.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {usuario.tipo === 'sistema' ? 'Sistema' : 
                         usuario.tipo === 'operacional' ? 'Operacional' : 
                         usuario.tipo === 'ambos' ? 'Ambos' : 'Sistema'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {usuario.permissions?.length || 0} permissões
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(usuario.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetalhesUsuario(usuario)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditarUsuario(usuario)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Editar Permissões
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editarUsuario && (
        <EditarPermissoesUsuarioDialog
          open={true}
          onOpenChange={(open) => !open && setEditarUsuario(null)}
          usuario={editarUsuario}
        />
      )}
      {detalhesUsuario && (
        <DetalhesUsuarioDialog
          open={true}
          onOpenChange={(open) => !open && setDetalhesUsuario(null)}
          usuario={detalhesUsuario}
        />
      )}
    </>
  );
}
