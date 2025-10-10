import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Transportadora } from '@/types/transportadoras';

interface DetalhesTransportadoraDialogProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesTransportadoraDialog({ transportadora, open, onOpenChange }: DetalhesTransportadoraDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{transportadora.nome}</DialogTitle>
            <Badge variant={transportadora.status === 'ativa' ? 'default' : 'secondary'}>
              {transportadora.status}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Razão Social</h4>
              <p>{transportadora.razaoSocial}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">CNPJ</h4>
              <p>{transportadora.cnpj}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Responsável</h4>
              <p>{transportadora.responsavel}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Telefone</h4>
              <p>{transportadora.telefone}</p>
            </div>
            <div className="col-span-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Email</h4>
              <p>{transportadora.email}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Endereço</h3>
            <div className="space-y-1">
              <p>{transportadora.endereco.rua}, {transportadora.endereco.numero}</p>
              <p>{transportadora.endereco.bairro}</p>
              <p>{transportadora.endereco.cidade} - {transportadora.endereco.estado}</p>
              <p>CEP: {transportadora.endereco.cep}</p>
            </div>
          </div>

          {transportadora.dadosBancarios && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Dados Bancários</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Banco</h4>
                  <p>{transportadora.dadosBancarios.banco}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Agência</h4>
                  <p>{transportadora.dadosBancarios.agencia}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Conta</h4>
                  <p>{transportadora.dadosBancarios.conta}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Tipo</h4>
                  <p className="capitalize">{transportadora.dadosBancarios.tipoConta}</p>
                </div>
              </div>
            </div>
          )}

          {transportadora.observacoes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Observações</h3>
              <p className="text-sm text-muted-foreground">{transportadora.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
