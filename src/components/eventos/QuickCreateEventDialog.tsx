import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEventos } from '@/contexts/EventosContext';
import { useClientes } from '@/contexts/ClientesContext';
import { toast } from 'sonner';
import { ChevronDown, Calendar, MapPin, Tag, Sparkles } from 'lucide-react';
import { TipoEvento } from '@/types/eventos';
import { cn } from '@/lib/utils';

interface QuickCreateEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreateEventSheet({ open, onOpenChange }: QuickCreateEventSheetProps) {
  const { criarEvento } = useEventos();
  const { clientes } = useClientes();
  const [loading, setLoading] = useState(false);
  
  // Seções colapsáveis
  const [locationOpen, setLocationOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);

  // Campos essenciais
  const [nome, setNome] = useState('');
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('bar');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteId, setClienteId] = useState('');

  // Localização
  const [local, setLocal] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Extras
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [descricao, setDescricao] = useState('');

  // Auto-save para localStorage
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('eventoRascunho');
      if (saved) {
        const data = JSON.parse(saved);
        setNome(data.nome || '');
        setTipoEvento(data.tipoEvento || 'bar');
        setDataInicio(data.dataInicio || '');
        setDataFim(data.dataFim || '');
        setClienteId(data.clienteId || '');
        setLocal(data.local || '');
        setCep(data.cep || '');
        setEndereco(data.endereco || '');
        setNumero(data.numero || '');
        setComplemento(data.complemento || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setEstado(data.estado || '');
        setTags(data.tags || []);
        setDescricao(data.descricao || '');
      }
    }
  }, [open]);

  useEffect(() => {
    const rascunho = {
      nome, tipoEvento, dataInicio, dataFim, clienteId,
      local, cep, endereco, numero, complemento, bairro, cidade, estado,
      tags, descricao
    };
    localStorage.setItem('eventoRascunho', JSON.stringify(rascunho));
  }, [nome, tipoEvento, dataInicio, dataFim, clienteId, local, cep, endereco, numero, complemento, bairro, cidade, estado, tags, descricao]);

  const handleBuscarCEP = async () => {
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
        toast.success('CEP encontrado!');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!nome || !dataInicio || !clienteId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Extrair hora dos datetime-local
      const horaInicio = dataInicio ? dataInicio.split('T')[1] || '00:00' : '00:00';
      const horaFim = dataFim ? dataFim.split('T')[1] || '23:59' : '23:59';
      const dataInicioDate = dataInicio ? dataInicio.split('T')[0] : '';
      const dataFimDate = dataFim ? dataFim.split('T')[0] : dataInicioDate;

      await criarEvento({
        nome,
        tipoEvento,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
        horaInicio,
        horaFim,
        clienteId,
        comercialId: '', // Você pode adicionar um campo para isso se necessário
        local,
        endereco,
        cidade,
        estado,
        tags,
        descricao: descricao || ''
      });
      
      toast.success('Evento criado com sucesso!');
      localStorage.removeItem('eventoRascunho');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setTipoEvento('bar');
    setDataInicio('');
    setDataFim('');
    setClienteId('');
    setLocal('');
    setCep('');
    setEndereco('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEstado('');
    setTags([]);
    setDescricao('');
  };

  const isValid = nome && dataInicio && clienteId;
  const filledFields = [nome, dataInicio, clienteId, local, cidade, tags.length > 0].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] lg:w-[650px] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Criar Evento Rápido
            </SheetTitle>
            <SheetDescription>
              Preencha as informações essenciais. Você pode completar os detalhes depois.
              <span className="block text-xs text-muted-foreground mt-1">
                {filledFields} de 6 campos recomendados preenchidos
              </span>
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="space-y-4 py-4 px-6">
          {/* SEÇÃO ESSENCIAL */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Informações Essenciais
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">Nome do Evento *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Festival de Verão 2025"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Tipo de Evento *</Label>
                <div className="flex flex-wrap gap-2">
                  {(['bar', 'ingresso', 'hibrido'] as TipoEvento[]).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoEvento(tipo)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        "border-2 hover:scale-105",
                        tipoEvento === tipo
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      {tipo === 'bar' ? '🍺 Bar' : tipo === 'ingresso' ? '🎫 Ingresso' : '🎭 Híbrido'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dataInicio" className="text-sm font-medium">Data/Hora Início *</Label>
                  <Input
                    id="dataInicio"
                    type="datetime-local"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim" className="text-sm font-medium">Data/Hora Fim</Label>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cliente" className="text-sm font-medium">Cliente *</Label>
                <select
                  id="cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO LOCALIZAÇÃO (COLAPSÁVEL) */}
          <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
            <div className="rounded-lg border bg-card">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Localização
                </h3>
                <ChevronDown className={cn("h-4 w-4 transition-transform", locationOpen && "rotate-180")} />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="p-4 pt-0 space-y-3">
                <div>
                  <Label htmlFor="local" className="text-sm font-medium">Nome do Local</Label>
                  <Input
                    id="local"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Arena Parque Central"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <Label htmlFor="cep" className="text-sm font-medium">CEP</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="cep"
                        value={cep}
                        onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                        placeholder="00000000"
                        maxLength={8}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBuscarCEP}
                        disabled={cep.length !== 8}
                      >
                        Buscar
                      </Button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cidade" className="text-sm font-medium">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label htmlFor="endereco" className="text-sm font-medium">Endereço</Label>
                    <Input
                      id="endereco"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero" className="text-sm font-medium">Número</Label>
                    <Input
                      id="numero"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* SEÇÃO EXTRAS (COLAPSÁVEL) */}
          <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
            <div className="rounded-lg border bg-card">
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Informações Adicionais
                </h3>
                <ChevronDown className={cn("h-4 w-4 transition-transform", extrasOpen && "rotate-180")} />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="p-4 pt-0 space-y-3">
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Digite uma tag e pressione Enter"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                      Adicionar
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Informações adicionais sobre o evento..."
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4 mt-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="relative"
            >
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
