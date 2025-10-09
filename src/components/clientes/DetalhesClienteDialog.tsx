import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cliente } from '@/types/eventos';
import { User, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DetalhesClienteDialogProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesClienteDialog({ cliente, open, onOpenChange }: DetalhesClienteDialogProps) {
  const enderecoCompleto = `${cliente.endereco.logradouro}, ${cliente.endereco.numero}${
    cliente.endereco.complemento ? ` - ${cliente.endereco.complemento}` : ''
  } - ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.estado} - CEP: ${cliente.endereco.cep}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {cliente.tipo === 'CPF' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            {cliente.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados Cadastrais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Dados Cadastrais</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-2">
                {cliente.tipo === 'CPF' ? <User className="h-4 w-4 mt-0.5" /> : <Building2 className="h-4 w-4 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {cliente.tipo === 'CPF' ? 'CPF' : 'CNPJ'}
                  </p>
                  <p className="text-sm font-medium">{cliente.documento}</p>
                </div>
              </div>

              {cliente.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{cliente.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{cliente.telefone}</p>
                </div>
              </div>

              {cliente.whatsapp && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-sm font-medium">{cliente.whatsapp}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Endereço */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>
            <p className="text-sm">{enderecoCompleto}</p>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações Adicionais
            </h3>
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{cliente.tipo === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Localização:</span>
                <span className="font-medium">{cliente.endereco.cidade}/{cliente.endereco.estado}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
