import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Contrato, StatusContrato } from '@/types/contratos';
import { useContratos } from '@/hooks/contratos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { gerarPDFContrato } from '@/utils/pdfGenerator';
import { 
  FileText, 
  Download, 
  Send, 
  Check, 
  X, 
  Clock,
  FileSignature,
  Paperclip,
  History,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useClientes } from '@/hooks/clientes';
import { useEventos } from '@/hooks/eventos';

interface DetalhesContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
  onEdit?: () => void;
  onConverter?: () => void;
}

const statusConfig: Record<StatusContrato, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  proposta: { label: 'Proposta', variant: 'secondary', icon: FileText },
  em_negociacao: { label: 'Em Negociação', variant: 'default', icon: Clock },
  aprovada: { label: 'Aprovada', variant: 'default', icon: CheckCircle2 },
  rascunho: { label: 'Rascunho', variant: 'secondary', icon: FileText },
  em_revisao: { label: 'Em Revisão', variant: 'default', icon: Clock },
  aguardando_assinatura: { label: 'Aguardando Assinatura', variant: 'default', icon: FileSignature },
  assinado: { label: 'Assinado', variant: 'default', icon: Check },
  cancelado: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
  expirado: { label: 'Expirado', variant: 'secondary', icon: X },
};

export function DetalhesContratoDialog({ open, onOpenChange, contrato, onEdit, onConverter }: DetalhesContratoDialogProps) {
  const { aprovarProposta } = useContratos();
  const { clientes } = useClientes();
  const { eventos } = useEventos();
  const [simularAssinaturaOpen, setSimularAssinaturaOpen] = useState(false);

  if (!contrato) return null;

  const cliente = clientes.find(c => c.id === contrato.clienteId);
  const evento = eventos.find(e => e.id === contrato.eventoId);
  const StatusIcon = statusConfig[contrato.status]?.icon || FileText;
  const isProposta = ['proposta', 'em_negociacao', 'aprovada'].includes(contrato.status);

  const assinadasCount = contrato.assinaturas.filter(a => a.assinado).length;
  const totalAssinaturas = contrato.assinaturas.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{contrato.titulo}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isProposta ? 'Proposta' : 'Contrato'} {contrato.numero}
              </p>
            </div>
            <Badge variant={statusConfig[contrato.status]?.variant || 'secondary'}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[contrato.status]?.label || contrato.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            {isProposta && contrato.itens && <TabsTrigger value="itens">Itens</TabsTrigger>}
            {isProposta && <TabsTrigger value="condicoes">Condições</TabsTrigger>}
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
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
                <p className="font-medium">{statusConfig[contrato.status]?.label || contrato.status}</p>
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
                    {contrato.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}
              {isProposta && contrato.validade && (
                <div>
                  <span className="text-muted-foreground">Validade:</span>
                  <p className="font-medium">
                    {format(new Date(contrato.validade), "dd/MM/yyyy")}
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
            </div>
            
            {isProposta && contrato.dadosEvento && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Dados do Evento</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <p className="font-medium">{contrato.dadosEvento.nome}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Local:</span>
                      <p className="font-medium">{contrato.dadosEvento.local}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cidade:</span>
                      <p className="font-medium">{contrato.dadosEvento.cidade}/{contrato.dadosEvento.estado}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>
                      <p className="font-medium">
                        {format(new Date(contrato.dadosEvento.dataInicio), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
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

          {/* Tab: Itens (apenas propostas) */}
          {isProposta && contrato.itens && (
            <TabsContent value="itens">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Tipo</th>
                      <th className="text-left p-3 text-sm font-medium">Descrição</th>
                      <th className="text-right p-3 text-sm font-medium">Qtd</th>
                      <th className="text-right p-3 text-sm font-medium">Valor Unit.</th>
                      <th className="text-right p-3 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contrato.itens.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3 text-sm capitalize">{item.tipo}</td>
                        <td className="p-3 text-sm">{item.descricao}</td>
                        <td className="p-3 text-sm text-right">{item.quantidade} {item.unidade}</td>
                        <td className="p-3 text-sm text-right">
                          {item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-3 text-sm text-right font-medium">
                          {item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-semibold">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">Total:</td>
                      <td className="p-3 text-right text-primary">
                        {contrato.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>
          )}

          {/* Tab: Condições (apenas propostas) */}
          {isProposta && (
            <TabsContent value="condicoes" className="space-y-4">
              {contrato.condicoesPagamento && (
                <div>
                  <h4 className="font-semibold mb-2">Condições de Pagamento</h4>
                  <p className="text-sm whitespace-pre-wrap">{contrato.condicoesPagamento}</p>
                </div>
              )}
              {contrato.prazoExecucao && (
                <div>
                  <h4 className="font-semibold mb-2">Prazo de Execução</h4>
                  <p className="text-sm">{contrato.prazoExecucao}</p>
                </div>
              )}
              {contrato.garantia && (
                <div>
                  <h4 className="font-semibold mb-2">Garantia</h4>
                  <p className="text-sm">{contrato.garantia}</p>
                </div>
              )}
              {contrato.observacoesComerciais && (
                <div>
                  <h4 className="font-semibold mb-2">Observações Comerciais</h4>
                  <p className="text-sm whitespace-pre-wrap">{contrato.observacoesComerciais}</p>
                </div>
              )}
            </TabsContent>
          )}

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

          {/* Tab: Histórico */}
          <TabsContent value="historico">
            <div className="space-y-4">
              {contrato.aprovacoesHistorico?.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {index < (contrato.aprovacoesHistorico?.length || 0) - 1 && (
                      <div className="w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium capitalize">{item.acao}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm")} - {item.usuario}
                    </p>
                    {item.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1">{item.observacoes}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-0.5 h-full bg-border" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">{isProposta ? 'Proposta' : 'Contrato'} atualizado</p>
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
                  <p className="text-sm font-medium">{isProposta ? 'Proposta' : 'Contrato'} criado</p>
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
          {contrato.status === 'proposta' && (
              <Button variant="default" onClick={() => {
                aprovarProposta.mutate({ contratoId: contrato.id });
                onOpenChange(false);
              }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprovar Proposta
              </Button>
            )}
            {contrato.status === 'aprovada' && onConverter && (
              <Button variant="default" onClick={onConverter}>
                <FileSignature className="mr-2 h-4 w-4" />
                Converter em Contrato
              </Button>
            )}
            {contrato.status === 'assinado' && (
              <Button variant="outline" onClick={() => gerarPDFContrato(contrato, 'download')}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            )}
            {(contrato.status === 'rascunho' || contrato.status === 'em_revisao' || contrato.status === 'proposta') && onEdit && (
              <Button onClick={onEdit}>
                Editar {isProposta ? 'Proposta' : 'Contrato'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}