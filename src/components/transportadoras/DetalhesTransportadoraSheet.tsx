import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Transportadora } from '@/types/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';
import { InfoGridList } from '@/components/shared/InfoGrid';
import { Building2, FileText, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DetalhesTransportadoraSheetProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesTransportadoraSheet({ transportadora, open, onOpenChange }: DetalhesTransportadoraSheetProps) {
  const isMobile = useIsMobile();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-display text-navy-800">
              {transportadora.nome}
            </SheetTitle>
            <Badge variant={transportadora.status === 'ativa' ? 'default' : 'secondary'}>
              {transportadora.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Cadastrais</h3>
            <InfoGridList
              items={[
                {
                  icon: Building2,
                  label: 'Razão Social',
                  value: transportadora.razaoSocial,
                },
                {
                  icon: FileText,
                  label: 'CNPJ',
                  value: transportadora.cnpj,
                },
                {
                  icon: User,
                  label: 'Responsável',
                  value: transportadora.responsavel,
                },
                {
                  icon: Phone,
                  label: 'Telefone',
                  value: transportadora.telefone,
                },
                {
                  icon: Mail,
                  label: 'Email',
                  value: transportadora.email,
                  separator: false,
                },
              ]}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <InfoGridList
              items={[
                {
                  icon: MapPin,
                  label: 'Endereço Completo',
                  value: (
                    <>
                      <p>{transportadora.endereco.rua}, {transportadora.endereco.numero}</p>
                      {transportadora.endereco.complemento && <p className="text-sm text-muted-foreground">{transportadora.endereco.complemento}</p>}
                      <p>{transportadora.endereco.bairro}</p>
                      <p>{transportadora.endereco.cidade} - {transportadora.endereco.estado}</p>
                      <p>CEP: {transportadora.endereco.cep}</p>
                    </>
                  ),
                  separator: false,
                },
              ]}
            />
          </div>

          {transportadora.dadosBancarios && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Dados Bancários</h3>
                <InfoGridList
                  items={[
                    {
                      icon: CreditCard,
                      label: 'Banco',
                      value: transportadora.dadosBancarios.banco,
                    },
                    {
                      icon: CreditCard,
                      label: 'Agência',
                      value: transportadora.dadosBancarios.agencia,
                    },
                    {
                      icon: CreditCard,
                      label: 'Conta',
                      value: transportadora.dadosBancarios.conta,
                    },
                    {
                      icon: CreditCard,
                      label: 'Tipo',
                      value: <span className="capitalize">{transportadora.dadosBancarios.tipoConta}</span>,
                      separator: false,
                    },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
