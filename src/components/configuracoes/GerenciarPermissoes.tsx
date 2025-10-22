import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search } from "lucide-react";

interface Permission {
  id: string;
  modulo: string;
  acao: string;
  descricao: string;
  categoria: string;
}

interface GerenciarPermissoesProps {
  userId: string;
  userPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function GerenciarPermissoes({ 
  userId, 
  userPermissions, 
  onPermissionsChange,
  disabled = false 
}: GerenciarPermissoesProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('categoria', { ascending: true })
        .order('modulo', { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  const filteredPermissions = permissions.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorias = Array.from(new Set(filteredPermissions.map(p => p.categoria)));

  const togglePermission = (permissionId: string) => {
    if (disabled) return;
    
    const newPermissions = userPermissions.includes(permissionId)
      ? userPermissions.filter(id => id !== permissionId)
      : [...userPermissions, permissionId];
    
    onPermissionsChange(newPermissions);
  };

  const toggleCategoria = (categoria: string) => {
    if (disabled) return;
    
    const permissoesCategoria = filteredPermissions
      .filter(p => p.categoria === categoria)
      .map(p => p.id);
    
    const todasSelecionadas = permissoesCategoria.every(id => userPermissions.includes(id));
    
    if (todasSelecionadas) {
      onPermissionsChange(userPermissions.filter(id => !permissoesCategoria.includes(id)));
    } else {
      const novasPermissoes = Array.from(new Set([...userPermissions, ...permissoesCategoria]));
      onPermissionsChange(novasPermissoes);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando permissões...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões do Usuário</CardTitle>
        <CardDescription>
          Selecione as permissões específicas que este usuário terá no sistema
        </CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar permissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-right">Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => {
                const permissoesCategoria = filteredPermissions.filter(p => p.categoria === categoria);
                const todasSelecionadas = permissoesCategoria.every(p => userPermissions.includes(p.id));
                const algumasSelecionadas = permissoesCategoria.some(p => userPermissions.includes(p.id));

                return (
                  <>
                    <TableRow key={`header-${categoria}`} className="bg-muted/50 hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={todasSelecionadas}
                          onCheckedChange={() => toggleCategoria(categoria)}
                          disabled={disabled}
                          className={algumasSelecionadas && !todasSelecionadas ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                      </TableCell>
                      <TableCell colSpan={3} className="font-semibold">
                        <Badge variant="outline">{categoria}</Badge>
                      </TableCell>
                    </TableRow>
                    {permissoesCategoria.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Checkbox
                            checked={userPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                            disabled={disabled}
                          />
                        </TableCell>
                        <TableCell>{permission.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {permission.modulo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {permission.acao}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total: {userPermissions.length} permissões selecionadas</p>
        </div>
      </CardContent>
    </Card>
  );
}
