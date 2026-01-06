import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock, FileText, Truck } from "lucide-react";
import { Evento, MaterialParaFrete, EnderecoCliente, FormaPagamentoFrete } from "@/types/eventos";
import { useTransportadoras } from "@/hooks/transportadoras";
import { useClienteEvento } from "@/hooks/transportadoras/useClienteEvento";
import { useEnderecoEmpresa } from "@/hooks/transportadoras/useEnderecoEmpresa";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { UseMutationResult } from "@tanstack/react-query";
import { RotaAtendida } from "@/types/transportadoras";

interface VincularFreteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento;
  materiais: MaterialParaFrete[];
  onVincular: UseMutationResult<unknown, Error, unknown>;
}

export function VincularFreteDialog({
  open,
  onOpenChange,
  evento,
  materiais,
  onVincular,
}: VincularFreteDialogProps) {
  const [etapa, setEtapa] = useState<'selecionar-materiais' | 'selecionar-transportadora' | 'confirmar'>('selecionar-materiais');
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([]);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<string | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoFrete>('a_combinar');
  const [observacoes, setObservacoes] = useState('');

  const { transportadoras } = useTransportadoras();
  const { data: clienteEventoData } = useClienteEvento(evento.id);
  const { enderecoFormatado: enderecoEmpresa } = useEnderecoEmpresa();

  // Filtrar transportadoras pela região do evento
  const transportadorasDisponiveis = transportadoras.filter((t) => {
    if (!t.rotasAtendidas || t.rotasAtendidas.length === 0) return false;
    return t.rotasAtendidas.some(
      (r: RotaAtendida) => r.cidadeDestino === evento.cidade && r.estadoDestino === evento.estado && r.ativa === true
    );
  });

  // Dados calculados
  const transportadora = transportadoras.find((t) => t.id === transportadoraSelecionada);
  const rota = transportadora?.rotasAtendidas?.find(
    (r: RotaAtendida) => r.cidadeDestino === evento.cidade && r.estadoDestino === evento.estado
  );
  
  const dataEvento = new Date(evento.dataInicio);
  const dataPrevista = rota ? addDays(dataEvento, -(rota.prazoEntrega || 0)) : dataEvento;
  const valorTotal = (rota?.valorBase || 0) * materiaisSelecionados.length;
  
  // Endereço destino completo
  let destino = '';
  if (clienteEventoData?.clienteEndereco) {
    const end = clienteEventoData.clienteEndereco as EnderecoCliente;
    destino = `${end.logradouro || ''}, ${end.numero || ''} - ${end.bairro || ''}, ${end.cidade || ''}/${end.estado || ''} - CEP ${end.cep || ''}`;
  } else {
    destino = `${evento.endereco}, ${evento.cidade} - ${evento.estado}`;
  }

  const handleConfirmar = async () => {
    if (!transportadoraSelecionada || materiaisSelecionados.length === 0) return;
    
    await onVincular.mutateAsync({
      materialIds: materiaisSelecionados,
      transportadoraId: transportadoraSelecionada,
      transportadoraNome: transportadora?.nome || '',
      dadosEnvio: {
        origem: enderecoEmpresa,
        destino,
        dataEntregaPrevista: format(dataPrevista, 'yyyy-MM-dd'),
        valor: valorTotal,
        formaPagamento,
        observacoes,
      },
    });
    
    onOpenChange(false);
    // Resetar estados
    setEtapa('selecionar-materiais');
    setMateriaisSelecionados([]);
    setTransportadoraSelecionada(null);
    setFormaPagamento('a_combinar');
    setObservacoes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Frete para Materiais</DialogTitle>
          <DialogDescription>
            Vincule materiais a um frete com transportadora
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de etapas */}
        <div className="flex items-center justify-between mb-6">
          <div className={cn("flex items-center gap-2", etapa === 'selecionar-materiais' && "text-primary")}>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <span className="text-sm font-medium">Materiais</span>
          </div>
          <Separator className="flex-1 mx-4" />
          <div className={cn("flex items-center gap-2", etapa === 'selecionar-transportadora' && "text-primary")}>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <span className="text-sm font-medium">Transportadora</span>
          </div>
          <Separator className="flex-1 mx-4" />
          <div className={cn("flex items-center gap-2", etapa === 'confirmar' && "text-primary")}>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-sm font-medium">Confirmar</span>
          </div>
        </div>

        {/* Conteúdo das etapas */}
        {etapa === 'selecionar-materiais' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione os materiais que serão transportados ({materiais.length} disponíveis)
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {materiais.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={materiaisSelecionados.includes(material.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMateriaisSelecionados([...materiaisSelecionados, material.id]);
                          } else {
                            setMateriaisSelecionados(materiaisSelecionados.filter(id => id !== material.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{material.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {material.serial && (
                            <Badge variant="outline" className="text-xs">Serial: {material.serial}</Badge>
                          )}
                          {material.transportadora && (
                            <Badge variant="secondary" className="text-xs">{material.transportadora}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {etapa === 'selecionar-transportadora' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transportadoras disponíveis para {evento.cidade}/{evento.estado}
            </p>
            
            {transportadorasDisponiveis.length === 0 ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Nenhuma transportadora cadastrada para esta região.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {transportadorasDisponiveis.map((t) => {
                  const rotaEvento = t.rotasAtendidas?.find(
                    (r: RotaAtendida) => r.cidadeDestino === evento.cidade && r.estadoDestino === evento.estado
                  );
                  return (
                    <Card
                      key={t.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        transportadoraSelecionada === t.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setTransportadoraSelecionada(t.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{t.nome}</p>
                          <p className="text-sm text-muted-foreground">{t.razao_social}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {rotaEvento?.prazoEntrega} dias
                            </Badge>
                            {rotaEvento?.valorBase && (
                              <Badge variant="outline" className="text-xs">
                                R$ {rotaEvento.valorBase.toFixed(2)} / unidade
                              </Badge>
                            )}
                          </div>
                        </div>
                        {transportadoraSelecionada === t.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {etapa === 'confirmar' && (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Revise os dados antes de confirmar
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Materiais:</span>
                  <p className="font-medium">{materiaisSelecionados.length} itens</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transportadora:</span>
                  <p className="font-medium">{transportadora?.nome}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Origem:</span>
                  <p className="font-medium text-xs">{enderecoEmpresa}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Destino:</span>
                  <p className="font-medium text-xs">{destino}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data Prevista:</span>
                  <p className="font-medium">{format(dataPrevista, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Total:</span>
                  <p className="font-medium">R$ {valorTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Forma de Pagamento *</Label>
                <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamentoFrete)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Antecipado</SelectItem>
                    <SelectItem value="na_entrega">Na Entrega</SelectItem>
                    <SelectItem value="a_combinar">A Combinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o frete..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {etapa !== 'selecionar-materiais' && (
            <Button
              variant="outline"
              onClick={() => {
                if (etapa === 'selecionar-transportadora') setEtapa('selecionar-materiais');
                if (etapa === 'confirmar') setEtapa('selecionar-transportadora');
              }}
            >
              Voltar
            </Button>
          )}
          
          {etapa === 'selecionar-materiais' && (
            <Button
              onClick={() => setEtapa('selecionar-transportadora')}
              disabled={materiaisSelecionados.length === 0}
            >
              Próximo ({materiaisSelecionados.length} selecionados)
            </Button>
          )}

          {etapa === 'selecionar-transportadora' && (
            <Button
              onClick={() => setEtapa('confirmar')}
              disabled={!transportadoraSelecionada}
            >
              Próximo
            </Button>
          )}

          {etapa === 'confirmar' && (
            <Button onClick={handleConfirmar} disabled={onVincular.isPending}>
              {onVincular.isPending ? 'Criando...' : 'Confirmar e Criar Frete'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
