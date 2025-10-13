import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const permissoes = [
  { modulo: "Eventos", admin: true, comercial: "Próprios", suporte: "Leitura" },
  { modulo: "Dados Financeiros", admin: true, comercial: "Próprios", suporte: false },
  { modulo: "Clientes", admin: true, comercial: true, suporte: false },
  { modulo: "Estoque", admin: true, comercial: "Leitura", suporte: true },
  { modulo: "Transportadoras", admin: true, comercial: false, suporte: true },
  { modulo: "Contratos", admin: true, comercial: true, suporte: false },
  { modulo: "Demandas", admin: true, comercial: "Criar", suporte: true },
  { modulo: "Usuários", admin: true, comercial: false, suporte: false },
  { modulo: "Relatórios", admin: true, comercial: "Limitado", suporte: false },
  { modulo: "Integrações", admin: true, comercial: false, suporte: false },
  { modulo: "Aprovar Reembolsos", admin: true, comercial: false, suporte: false },
];

function PermissaoCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-muted-foreground mx-auto" />;
  }
  return (
    <Badge variant="outline" className="text-xs">
      {value}
    </Badge>
  );
}

export function MatrizPermissoes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
        <CardDescription>
          Visualize as permissões de cada função no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Módulo</TableHead>
                <TableHead className="text-center">
                  <Badge variant="destructive">Admin</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-blue-500">Comercial</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-green-500">Suporte</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissoes.map((permissao) => (
                <TableRow key={permissao.modulo}>
                  <TableCell className="font-medium">{permissao.modulo}</TableCell>
                  <TableCell className="text-center">
                    <PermissaoCell value={permissao.admin} />
                  </TableCell>
                  <TableCell className="text-center">
                    <PermissaoCell value={permissao.comercial} />
                  </TableCell>
                  <TableCell className="text-center">
                    <PermissaoCell value={permissao.suporte} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p><Check className="inline h-4 w-4 text-green-500" /> = Acesso completo</p>
          <p><X className="inline h-4 w-4" /> = Sem acesso</p>
          <p><Badge variant="outline" className="text-xs">Texto</Badge> = Acesso limitado ou específico</p>
        </div>
      </CardContent>
    </Card>
  );
}
