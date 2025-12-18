import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DocumentUpload } from '@/components/shared/DocumentUpload';
import { SelecionarMaterialParaDocumentoDialog } from '@/components/eventos/modals/SelecionarMaterialParaDocumentoDialog';
import { GerarDeclaracaoTransporteDialog } from '@/components/eventos/modals/GerarDeclaracaoTransporteDialog';
import { useTransportadoras, useClienteEvento, useEnderecoEmpresa } from '@/hooks/transportadoras';
import { useEventos } from '@/hooks/eventos';
import { useEventosMateriaisAlocados } from '@/contexts/eventos/useEventosMateriaisAlocados';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NovoEnvioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoEnvioSheet({ open, onOpenChange }: NovoEnvioSheetProps) {
  const { criarEnvio, transportadoras } = useTransportadoras();
  const { eventos } = useEventos();
  const isMobile = useIsMobile();
  
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [eventoSearchOpen, setEventoSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    transportadoraId: '',
    eventoId: '',
    tipo: 'ida' as 'ida' | 'volta',
    origem: '',
    destino: '',
    dataEntregaPrevista: '',
    valor: 0,
    formaPagamento: 'a_combinar' as 'antecipado' | 'na_entrega' | 'a_combinar',
    comprovantePagamento: '',
    observacoes: '',
  });

  // Estados para o fluxo de geração de declaração
  const [showGerarDeclaracao, setShowGerarDeclaracao] = useState(false);
  const [showSelecionarMateriais, setShowSelecionarMateriais] = useState(false);
  const [showGerarDeclaracaoFinal, setShowGerarDeclaracaoFinal] = useState(false);
  const [envioRecemCriado, setEnvioRecemCriado] = useState<any>(null);
  const [materiaisParaDeclaracao, setMateriaisParaDeclaracao] = useState<any[]>([]);
  
  // Buscar materiais do evento selecionado
  const { materiaisAlocados } = useEventosMateriaisAlocados(eventoSelecionado);
  const { gerarDeclaracaoTransporte } = useEventosMateriaisAlocados(eventoSelecionado);
  
  // Buscar dados do cliente e endereço da empresa
  const { data: clienteEventoData } = useClienteEvento(eventoSelecionado);
  const { enderecoFormatado: enderecoEmpresa } = useEnderecoEmpresa();

  const handleUploadComprovante = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `comprovante-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('financeiro-anexos')
        .upload(fileName, file);
      
      if (uploadError) {
        toast.error('Erro ao enviar comprovante');
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('financeiro-anexos')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, comprovantePagamento: publicUrl }));
      toast.success('Comprovante enviado!');
    } catch {
      toast.error('Erro no upload');
    }
  };

  const transportadorasFiltradas = useMemo(() => {
    if (eventoSelecionado) {
      const evento = eventos.find(e => e.id === eventoSelecionado);
      if (evento) {
        return transportadoras.filter(t =>
          t.rotasAtendidas.some(r =>
            r.cidadeDestino === evento.cidade &&
            r.estadoDestino === evento.estado &&
            r.ativa
          )
        );
      }
    }
    return transportadoras;
  }, [eventoSelecionado, eventos, transportadoras]);

  useEffect(() => {
    if (formData.transportadoraId && eventoSelecionado) {
      const transportadora = transportadoras.find(t => t.id === formData.transportadoraId);
      const evento = eventos.find(e => e.id === eventoSelecionado);
      
      if (transportadora && evento) {
        const rota = transportadora.rotasAtendidas.find(r =>
          r.cidadeDestino === evento.cidade &&
          r.estadoDestino === evento.estado
        );

        if (rota) {
          const dataEvento = new Date(evento.dataInicio);
          const dataEntregaPrevista = addDays(dataEvento, -rota.prazoEntrega);
          
          // ORIGEM: Endereço da empresa (configurações) ou cidade da transportadora
          const novaOrigem = enderecoEmpresa || `${transportadora.endereco.cidade} - ${transportadora.endereco.estado}`;
          
          // DESTINO: Endereço completo do cliente (se disponível) ou endereço do evento
          let novoDestino = '';
          if (clienteEventoData?.clienteEndereco) {
            const end = clienteEventoData.clienteEndereco as import('@/types/eventos').EnderecoCliente;
            novoDestino = `${end.logradouro || ''}, ${end.numero || ''} - ${end.bairro || ''}, ${end.cidade || ''}/${end.estado || ''} - CEP ${end.cep || ''}`.trim();
          } else if (clienteEventoData?.eventoEndereco) {
            novoDestino = `${clienteEventoData.eventoEndereco}, ${clienteEventoData.eventoCidade} - ${clienteEventoData.eventoEstado}`;
          } else {
            novoDestino = `${evento.endereco}, ${evento.cidade} - ${evento.estado}`;
          }
          
          const novaData = format(dataEntregaPrevista, 'yyyy-MM-dd');
          const novoValor = rota.valorBase || 0;
          
          // Só atualizar se os valores mudaram
          if (
            formData.origem !== novaOrigem ||
            formData.destino !== novoDestino ||
            formData.dataEntregaPrevista !== novaData ||
            formData.valor !== novoValor
          ) {
            setFormData(prev => ({
              ...prev,
              origem: novaOrigem,
              destino: novoDestino,
              dataEntregaPrevista: novaData,
              valor: novoValor,
            }));
          }
        }
      }
    }
  }, [formData.transportadoraId, eventoSelecionado, transportadoras, eventos, enderecoEmpresa, clienteEventoData, formData.origem, formData.destino, formData.dataEntregaPrevista, formData.valor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado) return;
    
    try {
      const novoEnvio = await criarEnvio.mutateAsync({ 
        ...formData, 
        eventoId: eventoSelecionado, 
        status: 'pendente' 
      });
      
      setEnvioRecemCriado(novoEnvio);
      setShowGerarDeclaracao(true);
    } catch (error) {
      console.error('Erro ao criar envio:', error);
    }
  };

  const limparFormulario = () => {
    setFormData({
      transportadoraId: '',
      eventoId: '',
      tipo: 'ida',
      origem: '',
      destino: '',
      dataEntregaPrevista: '',
      valor: 0,
      formaPagamento: 'a_combinar',
      comprovantePagamento: '',
      observacoes: '',
    });
    setEventoSelecionado('');
    setEnvioRecemCriado(null);
    setMateriaisParaDeclaracao([]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Novo Envio
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            Registre um novo envio de materiais
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* LINHA 1: Evento (linha inteira com busca) */}
            <div>
              <Label htmlFor="evento" className="text-navy-700 text-sm">Evento *</Label>
              <Popover open={eventoSearchOpen} onOpenChange={setEventoSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={eventoSearchOpen}
                    className="w-full justify-between border-navy-200 hover:border-navy-300 h-9"
                  >
                    {eventoSelecionado
                      ? (() => {
                          const evento = eventos.find((e) => e.id === eventoSelecionado);
                          return evento ? `${evento.nome} - ${evento.cidade}/${evento.estado}` : "Buscar evento...";
                        })()
                      : "Buscar evento..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Digite para buscar evento..." />
                    <CommandList>
                      <CommandEmpty>Nenhum evento encontrado.</CommandEmpty>
                      <CommandGroup>
                        {eventos.map((evento) => (
                          <CommandItem
                            key={evento.id}
                            value={`${evento.nome} ${evento.cidade} ${evento.estado}`}
                            onSelect={() => {
                              setEventoSelecionado(evento.id);
                              setEventoSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                eventoSelecionado === evento.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{evento.nome}</span>
                              <span className="text-xs text-muted-foreground">
                                {evento.cidade}/{evento.estado} - {format(new Date(evento.dataInicio), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Alert de transportadoras */}
            {transportadorasFiltradas.length === 0 && eventoSelecionado && (
              <Alert className="border-amber-200 bg-amber-50 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  Nenhuma transportadora disponível para esta rota.
                </AlertDescription>
              </Alert>
            )}

            {/* LINHA 2: Transportadora + Tipo de Envio (lado a lado) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="transportadora" className="text-navy-700 text-sm">Transportadora *</Label>
                <Select
                  value={formData.transportadoraId}
                  onValueChange={(value) => setFormData({ ...formData, transportadoraId: value })}
                  disabled={!eventoSelecionado}
                  required
                >
                  <SelectTrigger className="border-navy-200 h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportadorasFiltradas.map((transportadora) => (
                      <SelectItem key={transportadora.id} value={transportadora.id}>
                        {transportadora.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo" className="text-navy-700 text-sm">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'ida' | 'volta') => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger className="border-navy-200 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ida">Ida</SelectItem>
                    <SelectItem value="volta">Volta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* LINHA 3: Origem + Destino (lado a lado) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="origem" className="text-navy-700 text-sm">Origem *</Label>
                <Input
                  id="origem"
                  required
                  value={formData.origem}
                  onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                  className="border-navy-200 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="destino" className="text-navy-700 text-sm">Destino *</Label>
                <Input
                  id="destino"
                  required
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  className="border-navy-200 h-9 text-sm"
                />
              </div>
            </div>

            {/* LINHA 4: Data Prevista + Valor + Forma Pagamento (3 colunas) */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="dataEntregaPrevista" className="text-navy-700 text-sm">Data Prevista *</Label>
                <Input
                  id="dataEntregaPrevista"
                  type="date"
                  required
                  value={formData.dataEntregaPrevista}
                  onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
                  className="border-navy-200 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="valor" className="text-navy-700 text-sm">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                  className="border-navy-200 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="formaPagamento" className="text-navy-700 text-sm">Pagamento *</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value: 'antecipado' | 'na_entrega' | 'a_combinar') => 
                    setFormData({ ...formData, formaPagamento: value })
                  }
                >
                  <SelectTrigger className="border-navy-200 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Antecipado</SelectItem>
                    <SelectItem value="na_entrega">Na Entrega</SelectItem>
                    <SelectItem value="a_combinar">A Combinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comprovante de Pagamento (se antecipado) */}
            {formData.formaPagamento === 'antecipado' && (
              <div>
                <Label className="text-navy-700 text-sm">Comprovante</Label>
                <DocumentUpload
                  onFileSelect={handleUploadComprovante}
                  currentFile={formData.comprovantePagamento}
                />
              </div>
            )}

            {/* LINHA 5: Observações (linha inteira) */}
            <div>
              <Label htmlFor="observacoes" className="text-navy-700 text-sm">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="border-navy-200 text-sm"
                rows={2}
                placeholder="Informações adicionais sobre o envio..."
              />
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-sm">
              Cancelar
            </Button>
            <Button type="submit" className="h-9 text-sm">
              Criar Envio
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>

      {/* Dialog: Perguntar se quer gerar declaração */}
      <AlertDialog open={showGerarDeclaracao} onOpenChange={setShowGerarDeclaracao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar Declaração de Transporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja gerar agora a declaração de transporte para este envio? 
              Você poderá selecionar os materiais que serão enviados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowGerarDeclaracao(false);
              limparFormulario();
              onOpenChange(false);
            }}>
              Não, gerar depois
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowGerarDeclaracao(false);
              setShowSelecionarMateriais(true);
            }}>
              Sim, gerar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Selecionar Materiais */}
      {showSelecionarMateriais && eventoSelecionado && (
        <SelecionarMaterialParaDocumentoDialog
          open={showSelecionarMateriais}
          onOpenChange={setShowSelecionarMateriais}
          materiais={materiaisAlocados.filter(m => 
            m.tipo_envio === 'antecipado' && 
            m.transportadora &&
            !m.declaracao_transporte_url
          )}
          titulo="Selecionar Materiais para Declaração"
          onConfirmar={async (materiaisSelecionadosIds) => {
            const { data: materiaisCompletos } = await supabase
              .from('eventos_materiais_alocados')
              .select('*')
              .in('id', materiaisSelecionadosIds);
            
            if (materiaisCompletos) {
              setMateriaisParaDeclaracao(materiaisCompletos);
              setShowSelecionarMateriais(false);
              setShowGerarDeclaracaoFinal(true);
            }
          }}
        />
      )}

      {/* Dialog: Gerar Declaração Final */}
      {showGerarDeclaracaoFinal && envioRecemCriado && (
        <GerarDeclaracaoTransporteDialog
          open={showGerarDeclaracaoFinal}
          onOpenChange={setShowGerarDeclaracaoFinal}
          materiais={materiaisParaDeclaracao}
          cliente={eventos.find(e => e.id === eventoSelecionado)?.cliente}
          transportadora={transportadoras.find(t => t.id === formData.transportadoraId)}
          onConfirmar={async (dados) => {
            try {
              // Garantir que todos os campos obrigatórios estão presentes
              const dadosCompletos = {
                alocacaoIds: materiaisParaDeclaracao.map(m => m.id),
                remetenteTipo: dados.remetenteTipo,
                remetenteMembroId: dados.remetenteMembroId,
                valoresDeclarados: dados.valoresDeclarados || {},
                observacoes: dados.observacoes || '',
              };
              
              await gerarDeclaracaoTransporte.mutateAsync(dadosCompletos);
              
              // Vincular materiais ao envio
              await supabase
                .from('eventos_materiais_alocados')
                .update({ envio_id: envioRecemCriado.id })
                .in('id', materiaisParaDeclaracao.map(m => m.id));
              
              toast.success('Declaração gerada e vinculada ao envio!');
              setShowGerarDeclaracaoFinal(false);
              limparFormulario();
              onOpenChange(false);
            } catch (error) {
              console.error('Erro ao gerar declaração:', error);
              toast.error('Erro ao gerar declaração');
            }
          }}
        />
      )}
    </Sheet>
  );
}
