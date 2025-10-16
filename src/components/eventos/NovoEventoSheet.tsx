import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClienteSelect } from './ClienteSelect';
import { ComercialSelect } from './ComercialSelect';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useEventos } from '@/contexts/EventosContext';
import { TipoEvento, SetorEvento, ConfiguracaoBar } from '@/types/eventos';
import { ConfiguracaoBarForm } from './ConfiguracaoBarForm';
import { cn } from '@/lib/utils';
import { buscarCEP } from '@/lib/api/viacep';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NovoEventoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventoCreated: () => void;
}

export function NovoEventoSheet({ open, onOpenChange, onEventoCreated }: NovoEventoSheetProps) {
  const { toast } = useToast();
  const { criarEvento } = useEventos();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingCep, setLoadingCep] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [local, setLocal] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [comercialId, setComercialId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [contatosAdicionais, setContatosAdicionais] = useState('');
  const [redesSociais, setRedesSociais] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('bar');
  const [configuracaoBar, setConfiguracaoBar] = useState<ConfiguracaoBar>({
    quantidadeMaquinas: 1,
    quantidadeBares: 1,
    temCardapio: false,
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBuscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'O CEP deve ter 8 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingCep(true);
    try {
      const dados = await buscarCEP(cepLimpo);
      
      setLogradouro(dados.logradouro);
      setBairro(dados.bairro);
      setCidade(dados.localidade);
      setEstado(dados.uf);

      toast({
        title: 'CEP encontrado!',
        description: 'Endereço preenchido automaticamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar CEP',
        description: error.message || 'CEP não encontrado.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setDataInicio(undefined);
    setDataFim(undefined);
    setHoraInicio('');
    setHoraFim('');
    setLocal('');
    setCep('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setComplemento('');
    setCidade('');
    setEstado('');
    setClienteId('');
    setComercialId('');
    setDescricao('');
    setObservacoes('');
    setContatosAdicionais('');
    setRedesSociais('');
    setTags([]);
    setTipoEvento('bar');
    setConfiguracaoBar({ quantidadeMaquinas: 1, quantidadeBares: 1, temCardapio: false });
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!clienteId || !comercialId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um cliente e um comercial.',
        variant: 'destructive',
      });
      return;
    }

    if (!dataInicio || !dataFim || !horaInicio || !horaFim) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha data e hora de início e término.',
        variant: 'destructive',
      });
      return;
    }

    if (dataFim < dataInicio) {
      toast({
        title: 'Data inválida',
        description: 'A data de término não pode ser anterior à data de início.',
        variant: 'destructive',
      });
      return;
    }

    if (!logradouro || !numero || !bairro) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha logradouro, número e bairro.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Formatar datas para string YYYY-MM-DD
      const dataInicioStr = format(dataInicio, 'yyyy-MM-dd');
      const dataFimStr = format(dataFim, 'yyyy-MM-dd');

      // Montar endereço completo
      const endereco = `${logradouro}, ${numero}${complemento ? ', ' + complemento : ''} - ${bairro}`;
      
      await criarEvento({
        nome,
        dataInicio: dataInicioStr,
        dataFim: dataFimStr,
        horaInicio,
        horaFim,
        local,
        cidade,
        estado,
        endereco,
        tipoEvento,
        clienteId,
        comercialId,
        tags,
        descricao,
        observacoes,
        contatosAdicionais,
        redesSociais,
        configuracaoBar: (tipoEvento === 'bar' || tipoEvento === 'hibrido') ? configuracaoBar : undefined,
      });
      
      resetForm();
      onOpenChange(false);
      onEventoCreated();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar evento',
        description: error.message || 'Ocorreu um erro ao criar o evento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return nome && dataInicio && dataFim && horaInicio && horaFim && tipoEvento;
    }
    if (currentStep === 2) {
      return local && logradouro && numero && bairro && cidade && estado;
    }
    if (currentStep === 3) {
      return clienteId && comercialId;
    }
    return true;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className="w-full sm:w-[600px] lg:w-[700px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-semibold">Novo Evento</SheetTitle>
          
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  currentStep >= step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    currentStep > step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Dados Básicos</span>
            <span>Localização</span>
            <span>Responsáveis</span>
            <span>Configurações</span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-4">
            {/* Step 1: Dados Básicos */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="tipoEvento">Tipo de Evento *</Label>
                  <Select value={tipoEvento} onValueChange={(value: TipoEvento) => setTipoEvento(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingresso">Evento com Ingresso</SelectItem>
                      <SelectItem value="bar">Evento de Bar</SelectItem>
                      <SelectItem value="hibrido">Híbrido (Ingresso + Bar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nome">Nome do Evento *</Label>
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    placeholder="Ex: Casamento João e Maria"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Data de Início *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dataInicio && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataInicio}
                          onSelect={setDataInicio}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="horaInicio">Hora de Início *</Label>
                    <Input 
                      id="horaInicio" 
                      type="time" 
                      value={horaInicio} 
                      onChange={(e) => setHoraInicio(e.target.value)} 
                    />
                  </div>

                  <div>
                    <Label>Data de Término *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dataFim && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataFim ? format(dataFim, "PPP", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataFim}
                          onSelect={setDataFim}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="horaFim">Hora de Término *</Label>
                    <Input 
                      id="horaFim" 
                      type="time" 
                      value={horaFim} 
                      onChange={(e) => setHoraFim(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Localização */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="local">Local *</Label>
                  <Input 
                    id="local" 
                    value={local} 
                    onChange={(e) => setLocal(e.target.value)} 
                    placeholder="Ex: Buffet Estrela Dourada"
                  />
                </div>

                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="cep" 
                      value={cep}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '');
                        const cepFormatado = valor.replace(/^(\d{5})(\d)/, '$1-$2');
                        setCep(cepFormatado);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={handleBuscarCEP}
                      disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
                      className="shrink-0 h-10 w-10"
                      title="Buscar CEP"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Busque o CEP para preencher automaticamente
                  </p>
                </div>

                {/* Logradouro + Número */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                  <div>
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input 
                      id="logradouro" 
                      value={logradouro} 
                      onChange={(e) => setLogradouro(e.target.value)} 
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input 
                      id="numero" 
                      value={numero} 
                      onChange={(e) => setNumero(e.target.value)} 
                      placeholder="123"
                    />
                  </div>
                </div>

                {/* Bairro + Complemento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input 
                      id="bairro" 
                      value={bairro} 
                      onChange={(e) => setBairro(e.target.value)} 
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input 
                      id="complemento" 
                      value={complemento} 
                      onChange={(e) => setComplemento(e.target.value)} 
                      placeholder="Apt, Sala..."
                    />
                  </div>
                </div>

                {/* Cidade + Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input 
                      id="cidade" 
                      value={cidade} 
                      onChange={(e) => setCidade(e.target.value)} 
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">UF *</Label>
                    <Input 
                      id="estado" 
                      value={estado} 
                      onChange={(e) => setEstado(e.target.value.toUpperCase())} 
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Responsáveis */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label>Cliente *</Label>
                  <ClienteSelect value={clienteId} onChange={setClienteId} />
                </div>

                <div>
                  <Label>Comercial *</Label>
                  <ComercialSelect value={comercialId} onChange={setComercialId} />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea 
                    id="descricao" 
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3} 
                    placeholder="Detalhes sobre o evento..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Configurações */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                {(tipoEvento === 'bar' || tipoEvento === 'hibrido') && (
                  <ConfiguracaoBarForm configuracao={configuracaoBar} onChange={setConfiguracaoBar} />
                )}

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="tags"
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Ex: Casamento, Corporativo..."
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary" size="sm">
                      Adicionar
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t flex-row justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onOpenChange(false)}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? (
              'Cancelar'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </>
            )}
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canGoNext()}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
