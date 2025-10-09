import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Evento, Despesa } from '@/types/eventos';
import { FileDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RelatorioFechamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento;
  despesasSelecionadas: string[];
}

export function RelatorioFechamentoDialog({ 
  open, 
  onOpenChange, 
  evento, 
  despesasSelecionadas 
}: RelatorioFechamentoDialogProps) {
  const { toast } = useToast();

  const despesasFiltradas = evento.financeiro.despesas.filter(d => 
    despesasSelecionadas.includes(d.id)
  );

  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0);

  const handleGerarPDF = () => {
    toast({
      title: 'PDF gerado!',
      description: 'O relatório de fechamento foi gerado com sucesso.',
    });
    
    // Aqui seria implementada a lógica real de geração de PDF
    // Por exemplo, usando jsPDF ou outra biblioteca
    console.log('Gerando PDF com os dados:', {
      evento: evento.nome,
      cliente: evento.cliente.nome,
      comercial: evento.comercial.nome,
      despesas: despesasFiltradas,
      total: totalDespesas
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatório de Fechamento do Evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados do Evento */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">Dados do Evento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome do Evento</p>
                <p className="font-medium">{evento.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{evento.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">{evento.dataInicio} às {evento.horaInicio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Fim</p>
                <p className="font-medium">{evento.dataFim} às {evento.horaFim}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">{evento.cidade}, {evento.estado}</p>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{evento.cliente.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{evento.cliente.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{evento.cliente.telefone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{evento.cliente.email}</p>
              </div>
            </div>
          </div>

          {/* Dados do Produtor/Comercial */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">Produtor Responsável</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{evento.comercial.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{evento.comercial.email}</p>
              </div>
            </div>
          </div>

          {/* Despesas Selecionadas */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Despesas do Evento</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 pb-2 border-b font-semibold text-sm">
                <div className="col-span-5">Descrição</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-2 text-right">Qtd</div>
                <div className="col-span-2 text-right">Valor Un.</div>
                <div className="col-span-1 text-right">Total</div>
              </div>
              {despesasFiltradas.map((despesa) => (
                <div key={despesa.id} className="grid grid-cols-12 gap-2 py-2 border-b text-sm">
                  <div className="col-span-5">{despesa.descricao}</div>
                  <div className="col-span-2">{despesa.categoria}</div>
                  <div className="col-span-2 text-right">{despesa.quantidade}</div>
                  <div className="col-span-2 text-right">
                    R$ {despesa.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-2 pt-3 mt-2 border-t-2 font-bold">
                <div className="col-span-11 text-right">Total de Despesas:</div>
                <div className="col-span-1 text-right text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGerarPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
