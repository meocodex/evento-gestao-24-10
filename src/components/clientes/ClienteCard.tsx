import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cliente } from '@/types/eventos';
import { User, Building2, Mail, Phone, MapPin, Eye, Pencil, Trash2 } from 'lucide-react';

interface ClienteCardProps {
  cliente: Cliente;
  onView: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

export function ClienteCard({ cliente, onView, onEdit, onDelete }: ClienteCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {cliente.tipo === 'CPF' ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            <div>
              <h3 className="font-semibold">{cliente.nome}</h3>
              <p className="text-sm text-muted-foreground">{cliente.documento}</p>
            </div>
          </div>
          <Badge variant="outline">{cliente.tipo}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {cliente.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{cliente.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{cliente.telefone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {cliente.endereco.cidade}/{cliente.endereco.estado}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(cliente)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(cliente)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(cliente)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
