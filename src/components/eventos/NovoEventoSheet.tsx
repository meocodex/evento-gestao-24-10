import { useState, useEffect } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ClienteSelect } from './ClienteSelect';
import { ComercialSelect } from './ComercialSelect';
import { X, Loader2, Plus } from 'lucide-react';
import { useEventos } from '@/hooks/eventos';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';
import { formatarCEP } from '@/lib/validations/cliente';

interface NovoEventoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventoCreated?: () => void;
}

export function NovoEventoSheet({ open, onOpenChange, onEventoCreated }: NovoEventoSheetProps) {
  const { toast } = useToast();
  const { criarEvento } = useEventos();
  const [nome, setNome] = useState('');
  const [dataHoraInicio, setDataHoraInicio] = useState('');
  const [dataHoraFim, setDataHoraFim] = useState('');
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
  const [loadingCep, setLoadingCep] = useState(false);
  const [utilizaPosEmpresa, setUtilizaPosEmpresa] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Busca automática de CEP com debounce
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const dados = await buscarEnderecoPorCEP(cep);
        
        if (dados) {
          setLogradouro(dados.logradouro);
          setBairro(dados.bairro);
          setCidade(dados.localidade);
          setEstado(dados.uf);

          toast({
            title: 'CEP encontrado!',
            description: 'Endereço preenchido automaticamente.',
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: 'CEP não encontrado',
          description: 'Preencha o endereço manualmente.',
          variant: 'destructive',
        });
      } finally {
        setLoadingCep(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [cep, toast]);

  const resetForm = () => {
    setNome('');
    setDataHoraInicio('');
    setDataHoraFim('');
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
    setUtilizaPosEmpresa(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId || !comercialId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um cliente e um comercial.',
        variant: 'destructive',
      });
      return;
    }

    if (dataHoraFim && dataHoraInicio && dataHoraFim < dataHoraInicio) {
      toast({
        title: 'Data inválida',
        description: 'A data/hora de término não pode ser anterior à data/hora de início.',
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
      // Extrair data e hora dos inputs datetime-local
      const dataInicio = dataHoraInicio.split('T')[0];
      const dataFim = dataHoraFim.split('T')[0];
      const horaInicio = dataHoraInicio.split('T')[1];
      const horaFim = dataHoraFim.split('T')[1];

      // Montar endereço completo
      const endereco = `${logradouro}, ${numero}${complemento ? ', ' + complemento : ''} - ${bairro}`;
      
      await criarEvento.mutateAsync({
        nome,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        local,
        cidade,
        estado,
        endereco,
        clienteId,
        comercialId,
        tags,
        descricao,
        observacoes,
        contatosAdicionais,
        redesSociais,
        utilizaPosEmpresa,
      });
      
      resetForm();
      onOpenChange(false);
      onEventoCreated?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar evento',
        description: error.message || 'Ocorreu um erro ao criar o evento. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      }
      title="Novo Evento"
      description="Preencha as informações do evento"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={criarEvento.isPending}
      submitText="Criar Evento"
      size="xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do Evento *</Label>
          <Input 
            id="nome" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Ex: Casamento João e Maria"
            required 
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataHoraInicio">Data e Hora de Início *</Label>
            <Input 
              id="dataHoraInicio" 
              type="datetime-local" 
              value={dataHoraInicio} 
              onChange={(e) => setDataHoraInicio(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="dataHoraFim">Data e Hora de Término *</Label>
            <Input 
              id="dataHoraFim" 
              type="datetime-local" 
              value={dataHoraFim} 
              onChange={(e) => setDataHoraFim(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="local">Local *</Label>
          <Input 
            id="local" 
            value={local} 
            onChange={(e) => setLocal(e.target.value)} 
            placeholder="Ex: Buffet Estrela Dourada"
            required 
          />
        </div>

        <div>
          <Label htmlFor="cep">CEP</Label>
          <div className="relative">
            <Input 
              id="cep" 
              value={cep}
              onChange={(e) => {
                const formatted = formatarCEP(e.target.value);
                setCep(formatted);
              }}
              placeholder="00000-000"
              maxLength={9}
              className={loadingCep ? "pr-10" : ""}
              disabled={loadingCep}
            />
            {loadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Digite o CEP para buscar automaticamente
          </p>
        </div>

        <div>
          <Label htmlFor="logradouro">Logradouro/Rua *</Label>
          <Input 
            id="logradouro" 
            value={logradouro} 
            onChange={(e) => setLogradouro(e.target.value)} 
            placeholder="Ex: Rua das Flores"
            required 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="numero">Número *</Label>
            <Input 
              id="numero" 
              value={numero} 
              onChange={(e) => setNumero(e.target.value)} 
              placeholder="Ex: 123"
              required 
            />
          </div>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input 
              id="complemento" 
              value={complemento} 
              onChange={(e) => setComplemento(e.target.value)} 
              placeholder="Ex: Apt 45"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input 
            id="bairro" 
            value={bairro} 
            onChange={(e) => setBairro(e.target.value)} 
            placeholder="Ex: Centro"
            required 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input 
              id="cidade" 
              value={cidade} 
              onChange={(e) => setCidade(e.target.value)} 
              placeholder="Ex: Cuiabá"
              required 
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Input 
              id="estado" 
              value={estado} 
              onChange={(e) => setEstado(e.target.value.toUpperCase())} 
              placeholder="MT"
              maxLength={2}
              required 
            />
          </div>
        </div>

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

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input 
              id="tags"
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Ex: Casamento, Corporativo, Premium..."
            />
            <Button type="button" onClick={handleAddTag} variant="secondary">
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="utilizaPosEmpresa"
            checked={utilizaPosEmpresa}
            onCheckedChange={(checked) => setUtilizaPosEmpresa(!!checked)}
          />
          <Label htmlFor="utilizaPosEmpresa" className="cursor-pointer font-normal">
            Utiliza POS da empresa
          </Label>
        </div>
      </div>
    </FormSheet>
  );
}
