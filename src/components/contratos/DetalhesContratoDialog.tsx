import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Contrato } from '@/types/contratos';
import { useContratos } from '@/contexts/ContratosContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Send, 
  Check, 
  X, 
  Clock,
  FileSignature,
  Paperclip,
  History
} from 'lucide-react';
import { useClientes } from '@/contexts/ClientesContext';
import { useEventos } from '@/contexts/EventosContext';

interface DetalhesContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
  onEdit?: () => void;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', variant: 'secondary' as const, icon: FileText },
  em_revisao: { label: 'Em Revisão', variant: 'default' as const, icon: Clock },
  aguardando_assinatura: { label: 'Aguardando Assinatura', variant: 'default' as const, icon: FileSignature },
  assinado: { label: 'Assinado', variant: 'default' as const, icon: Check },
  cancelado: { label: 'Cancelado', variant: 'secondary' as const, icon: X },
};

export function DetalhesContratoDialog({ open, onOpenChange, contrato, onEdit }: DetalhesContratoDialogProps) {
  const { gerarPDF } = useContratos();
  const { clientes } = useClientes();
  const { eventos } = useEventos();
  const [simularAssinaturaOpen, setSimularAssinaturaOpen] = useState(false);

  if (!contrato) return null;

  const cliente = clientes.find(c => c.id === contrato.clienteId);
  const evento = eventos.find(e => e.id === contrato.eventoId);
  const StatusIcon = statusConfig[contrato.status].icon;

  const assinadasCount = contrato.assinaturas.filter(a => a.assinado).length;
  const totalAssinaturas = contrato.assinaturas.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{contrato.titulo}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Contrato {contrato.numero}
                </p>
              </div>
              <Badge variant={statusConfig[contrato.status].variant}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig[contrato.status].label}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
              <TabsTrigger value="anexos">Anexos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            {/* Tab: Dados */}
            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium capitalize">{contrato.tipo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">{statusConfig[contrato.status].label}</p>
                </div>
                {cliente && (
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{cliente.nome}</p>
                  </div>
                )}
                {evento && (
                  <div>
                    <span className="text-muted-foreground">Evento:</span>
                    <p className="font-medium">{evento.nome}</p>
                  </div>
                )}
                {contrato.valor && (
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valor)}
                    </p>
                  </div>
                )}
                {contrato.dataInicio && (
                  <div>
                    <span className="text-muted-foreground">Data Início:</span>
                    <p className="font-medium">
                      {format(new Date(contrato.dataInicio), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                {contrato.dataFim && (
                  <div>
                    <span className="text-muted-foreground">Data Fim:</span>
                    <p className="font-medium">
                      {format(new Date(contrato.dataFim), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-medium">
                    {format(new Date(contrato.criadoEm), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
              </div>
              {contrato.observacoes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Observações:</span>
                    <p className="mt-1 text-sm">{contrato.observacoes}</p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Tab: Conteúdo */}
            <TabsContent value="conteudo">
              <div className="bg-muted/30 p-6 rounded-md border max-h-[500px] overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">{contrato.conteudo}</div>
              </div>
            </TabsContent>

            {/* Tab: Assinaturas */}
            <TabsContent value="assinaturas" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Assinaturas</h4>
                  <p className="text-sm text-muted-foreground">
                    {assinadasCount} de {totalAssinaturas} assinadas
                  </p>
                </div>
                {contrato.status === 'rascunho' && (
                  <Button size="sm" onClick={() => setSimularAssinaturaOpen(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar para Assinatura
                  </Button>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                {contrato.assinaturas.map((assinatura, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
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
                        {assinatura.dataAssinatura && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Assinado em {format(new Date(assinatura.dataAssinatura), "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Anexos */}
            <TabsContent value="anexos">
              {contrato.anexos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum anexo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contrato.anexos.map((anexo, index) => (
                    <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{anexo}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="historico">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-0.5 h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Contrato atualizado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(contrato.atualizadoEm), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contrato criado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(contrato.criadoEm), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <div className="flex gap-2">
              {contrato.status === 'assinado' && (
                <Button variant="outline" onClick={() => gerarPDF(contrato.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
              )}
              {(contrato.status === 'rascunho' || contrato.status === 'em_revisao') && onEdit && (
                <Button onClick={onEdit}>
                  Editar Contrato
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simular Assinatura Dialog - será criado separadamente */}
    </>
  );
}
