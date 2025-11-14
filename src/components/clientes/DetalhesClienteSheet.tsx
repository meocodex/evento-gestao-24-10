import { DetailsSheet } from '@/components/shared/sheets';
import { Cliente } from '@/types/eventos';
import { User, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { InfoGridList } from '@/components/shared/InfoGrid';
import { Badge } from '@/components/ui/badge';

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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy-800">Dados Cadastrais</h3>
            <Badge variant="outline">{cliente.tipo === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</Badge>
          </div>
          <InfoGridList
            items={[
              {
                icon: cliente.tipo === 'CPF' ? User : Building2,
                label: cliente.tipo === 'CPF' ? 'CPF' : 'CNPJ',
                value: cliente.documento,
              },
              ...(cliente.email ? [{
                icon: Mail,
                label: 'Email',
                value: cliente.email,
              }] : []),
              {
                icon: Phone,
                label: 'Telefone',
                value: cliente.telefone,
              },
              ...(cliente.whatsapp ? [{
                icon: Phone,
                label: 'WhatsApp',
                value: cliente.whatsapp,
                separator: false,
              }] : [{
                icon: Phone,
                label: 'Telefone',
                value: cliente.telefone,
                separator: false,
              }]),
            ]}
          />
        </div>

        <Separator className="bg-navy-100" />

        {/* Endereço */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-navy-800">
            <MapPin className="h-4 w-4" />
            Endereço
          </h3>
          <InfoGridList
            items={[
              {
                icon: MapPin,
                label: 'Endereço Completo',
                value: enderecoCompleto,
                separator: false,
              },
            ]}
          />
        </div>
      </div>
    </DetailsSheet>
  );
}
