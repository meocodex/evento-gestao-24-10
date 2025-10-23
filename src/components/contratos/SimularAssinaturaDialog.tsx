import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContratos } from '@/hooks/contratos';
import { Contrato } from '@/types/contratos';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';

interface SimularAssinaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
}

export function SimularAssinaturaDialog({ open, onOpenChange, contrato }: SimularAssinaturaDialogProps) {
  const { editarContrato, assinarContrato } = useContratos();

  if (!contrato) return null;

  const handleEnviarAssinatura = () => {
    editarContrato.mutate({ 
      id: contrato.id, 
      data: { status: 'aguardando_assinatura' }
    });
    onOpenChange(false);
  };

  const handleAssinar = (parte: string) => {
    assinarContrato.mutate({ contratoId: contrato.id, parte });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Simulação de Assinaturas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta é uma simulação para desenvolvimento. Em produção, as assinaturas serão feitas via ZapSign.
          </p>

          {contrato.status === 'rascunho' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm mb-3">
                O contrato está em rascunho. Clique abaixo para enviar para assinatura.
              </p>
              <Button onClick={handleEnviarAssinatura}>
                Enviar para Assinatura
              </Button>
            </div>
          )}

          {contrato.status !== 'rascunho' && (
            <>
              <h4 className="font-semibold">Signatários</h4>
              <div className="space-y-3">
                {contrato.assinaturas.map((assinatura, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{assinatura.nome}</h5>
                          {assinatura.assinado ? (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="mr-1 h-3 w-3" />
                              Assinado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{assinatura.parte}</p>
                        <p className="text-sm text-muted-foreground">{assinatura.email}</p>
                      </div>
                      {!assinatura.assinado && (
                        <Button
                          size="sm"
                          onClick={() => handleAssinar(assinatura.parte)}
                        >
                          Simular Assinatura
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
