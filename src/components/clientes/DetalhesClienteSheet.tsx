import { DetailsSheet } from '@/components/shared/sheets';
import { Cliente } from '@/types/eventos';
import { User, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DetalhesClienteSheetProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesClienteSheet({ cliente, open, onOpenChange }: DetalhesClienteSheetProps) {
  const enderecoCompleto = `${cliente.endereco.logradouro}, ${cliente.endereco.numero}${
    cliente.endereco.complemento ? ` - ${cliente.endereco.complemento}` : ''
  } - ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.estado} - CEP: ${cliente.endereco.cep}`;

  return (
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title={cliente.nome}
      size="lg"
    >
      <div className="space-y-6">
        {/* Dados Cadastrais */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-navy-800">Dados Cadastrais</h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              {cliente.tipo === 'CPF' ? <User className="h-4 w-4 mt-0.5 text-navy-600" /> : <Building2 className="h-4 w-4 mt-0.5 text-navy-600" />}
              <div className="flex-1">
                <p className="text-sm text-navy-600">
                  {cliente.tipo === 'CPF' ? 'CPF' : 'CNPJ'}
                </p>
                <p className="text-sm font-medium text-navy-900">{cliente.documento}</p>
              </div>
            </div>

            {cliente.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-navy-600" />
                <div className="flex-1">
                  <p className="text-sm text-navy-600">Email</p>
                  <p className="text-sm font-medium text-navy-900">{cliente.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-navy-600" />
              <div className="flex-1">
                <p className="text-sm text-navy-600">Telefone</p>
                <p className="text-sm font-medium text-navy-900">{cliente.telefone}</p>
              </div>
            </div>

            {cliente.whatsapp && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-navy-600" />
                <div className="flex-1">
                  <p className="text-sm text-navy-600">WhatsApp</p>
                  <p className="text-sm font-medium text-navy-900">{cliente.whatsapp}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-navy-100" />

        {/* Endereço */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-navy-800">
            <MapPin className="h-4 w-4" />
            Endereço
          </h3>
          <p className="text-sm text-navy-700">{enderecoCompleto}</p>
        </div>

        <Separator className="bg-navy-100" />

        {/* Informações Adicionais */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-navy-800">
            <Calendar className="h-4 w-4" />
            Informações Adicionais
          </h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-600">Tipo:</span>
              <span className="font-medium text-navy-900">{cliente.tipo === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-600">Localização:</span>
              <span className="font-medium text-navy-900">{cliente.endereco.cidade}/{cliente.endereco.estado}</span>
            </div>
          </div>
        </div>
      </div>
    </DetailsSheet>
  );
}
