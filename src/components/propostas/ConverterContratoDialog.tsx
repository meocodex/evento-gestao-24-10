import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useContratos } from '@/contexts/ContratosContext';
import { useEventos } from '@/contexts/EventosContext';
import { Contrato } from '@/types/contratos';
import { FileCheck, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConverterContratoDialogProps {
  contrato: Contrato | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConverterContratoDialog({ contrato, open, onOpenChange }: ConverterContratoDialogProps) {
  const { converterPropostaEmContrato } = useContratos();
  const { eventos } = useEventos();
  const [opcao, setOpcao] = useState<'vincular' | 'criar'>('criar');
  const [eventoId, setEventoId] = useState('');
  const [adicionarReceitas, setAdicionarReceitas] = useState(true);

  if (!contrato || !contrato.itens || contrato.status !== 'aprovada') return null;

  const eventosDoCliente = eventos.filter(e => e.cliente.id === contrato.clienteId);

  const handleConverter = async () => {
    if (opcao === 'vincular' && !eventoId) {
      toast({
        title: 'Erro',
        description: 'Selecione um evento para vincular',
        variant: 'destructive',
      });
      return;
    }

    await converterPropostaEmContrato(
      contrato.id,
      opcao,
      eventoId || undefined,
      contrato.dadosEvento,
      adicionarReceitas
    );

    onOpenChange(false);
  };

  const calcularTotal = () => {
    return contrato.itens?.reduce((acc, item) => acc + item.valorTotal, 0) || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Converter Proposta em Contrato</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da proposta */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Resumo da Proposta
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Proposta:</span>
                <p className="font-medium">{contrato.titulo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Número:</span>
                <p className="font-medium">{contrato.numero}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total de itens:</span>
                <p className="font-medium">{contrato.itens?.length || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor total:</span>
                <p className="font-semibold text-primary">
                  {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>

          {/* Opções de conversão */}
          <div>
            <Label className="mb-3 block">Como deseja proceder?</Label>
            <RadioGroup value={opcao} onValueChange={(v: any) => setOpcao(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="criar" id="criar" />
                <Label htmlFor="criar" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Criar novo evento</p>
                    <p className="text-sm text-muted-foreground">
                      Criar um novo evento com os dados da proposta
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="vincular" id="vincular" />
                <Label htmlFor="vincular" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Vincular a evento existente</p>
                    <p className="text-sm text-muted-foreground">
                      Vincular a proposta a um evento já cadastrado
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Se vincular, mostrar select de eventos */}
          {opcao === 'vincular' && (
            <div>
              <Label>Selecione o Evento</Label>
              <Select value={eventoId} onValueChange={setEventoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventosDoCliente.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum evento encontrado para este cliente
                    </div>
                  ) : (
                    eventosDoCliente.map(evento => (
                      <SelectItem key={evento.id} value={evento.id}>
                        <div className="flex flex-col">
                          <span>{evento.nome}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                            <span className="mx-1">•</span>
                            <MapPin className="h-3 w-3" />
                            {evento.cidade}/{evento.estado}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Se criar, mostrar preview dos dados */}
          {opcao === 'criar' && contrato.dadosEvento && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-semibold mb-3">Dados do Novo Evento</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{contrato.dadosEvento.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Data Início:</span>
                    <p className="font-medium">
                      {new Date(contrato.dadosEvento.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data Fim:</span>
                    <p className="font-medium">
                      {new Date(contrato.dadosEvento.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span>
                  <p className="font-medium">{contrato.dadosEvento.local}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cidade/Estado:</span>
                  <p className="font-medium">
                    {contrato.dadosEvento.cidade}/{contrato.dadosEvento.estado}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Opção de adicionar receitas */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/20">
            <Checkbox
              id="adicionar-receitas"
              checked={adicionarReceitas}
              onCheckedChange={(checked) => setAdicionarReceitas(checked === true)}
            />
            <Label htmlFor="adicionar-receitas" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Adicionar itens como receitas no evento</p>
                <p className="text-sm text-muted-foreground">
                  Os {contrato.itens?.length || 0} itens da proposta serão adicionados como receitas no financeiro do evento
                </p>
              </div>
            </Label>
          </div>

          {/* Preview das receitas */}
          {adicionarReceitas && contrato.itens && contrato.itens.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-sm">Receitas que serão criadas:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {contrato.itens.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 border-b last:border-0">
                    <span className="text-muted-foreground">{item.descricao}</span>
                    <span className="font-medium">
                      {item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm p-2 pt-3 font-semibold border-t-2">
                  <span>Total:</span>
                  <span className="text-primary">
                    {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConverter}
            disabled={opcao === 'vincular' && !eventoId}
          >
            Converter e Criar Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}