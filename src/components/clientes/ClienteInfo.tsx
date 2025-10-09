import { Cliente } from '@/types/eventos';
import { User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClienteInfoProps {
  cliente: Cliente;
}

export function ClienteInfo({ cliente }: ClienteInfoProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2">
          {cliente.tipo === 'CPF' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          <div>
            <p className="text-sm text-muted-foreground">{cliente.tipo === 'CPF' ? 'Cliente (CPF)' : 'Cliente (CNPJ)'}</p>
            <p className="font-medium">{cliente.nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-20">Documento:</span>
          <span className="text-sm font-medium">{cliente.documento}</span>
        </div>

        {cliente.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{cliente.email}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{cliente.telefone}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {cliente.endereco.cidade}/{cliente.endereco.estado}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
