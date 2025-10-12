import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Transportadora } from '@/types/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-navy-600 mb-1">Razão Social</h4>
              <p className="text-navy-900">{transportadora.razaoSocial}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-600 mb-1">CNPJ</h4>
              <p className="text-navy-900">{transportadora.cnpj}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-600 mb-1">Responsável</h4>
              <p className="text-navy-900">{transportadora.responsavel}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy-600 mb-1">Telefone</h4>
              <p className="text-navy-900">{transportadora.telefone}</p>
            </div>
            <div className="sm:col-span-2">
              <h4 className="text-sm font-semibold text-navy-600 mb-1">Email</h4>
              <p className="text-navy-900">{transportadora.email}</p>
            </div>
          </div>

          <div className="border-t border-navy-100 pt-6">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Endereço</h3>
            <div className="space-y-1 text-navy-700">
              <p>{transportadora.endereco.rua}, {transportadora.endereco.numero}</p>
              {transportadora.endereco.complemento && <p>{transportadora.endereco.complemento}</p>}
              <p>{transportadora.endereco.bairro}</p>
              <p>{transportadora.endereco.cidade} - {transportadora.endereco.estado}</p>
              <p>CEP: {transportadora.endereco.cep}</p>
            </div>
          </div>

          {transportadora.dadosBancarios && (
            <div className="border-t border-navy-100 pt-6">
              <h3 className="text-lg font-semibold text-navy-800 mb-4">Dados Bancários</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-navy-600 mb-1">Banco</h4>
                  <p className="text-navy-900">{transportadora.dadosBancarios.banco}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy-600 mb-1">Agência</h4>
                  <p className="text-navy-900">{transportadora.dadosBancarios.agencia}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy-600 mb-1">Conta</h4>
                  <p className="text-navy-900">{transportadora.dadosBancarios.conta}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy-600 mb-1">Tipo</h4>
                  <p className="text-navy-900 capitalize">{transportadora.dadosBancarios.tipoConta}</p>
                </div>
              </div>
            </div>
          )}

          {transportadora.observacoes && (
            <div className="border-t border-navy-100 pt-6">
              <h3 className="text-lg font-semibold text-navy-800 mb-2">Observações</h3>
              <p className="text-sm text-navy-600">{transportadora.observacoes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
