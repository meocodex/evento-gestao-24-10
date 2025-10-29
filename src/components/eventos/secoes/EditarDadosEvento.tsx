import { useState, useEffect } from 'react';
import { Evento } from '@/types/eventos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClienteSelect } from '../ClienteSelect';
import { ComercialSelect } from '../ComercialSelect';
import { X, Save, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';
import { formatarCEP } from '@/lib/validations/cliente';

interface EditarDadosEventoProps {
  evento: Evento;
  onSave: (data: Partial<Evento>) => void;
  onCancel: () => void;
}

export function EditarDadosEvento({ evento, onSave, onCancel }: EditarDadosEventoProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [nome, setNome] = useState(evento.nome);
  const [dataInicio, setDataInicio] = useState(evento.dataInicio);
  const [dataFim, setDataFim] = useState(evento.dataFim);
  const [horaInicio, setHoraInicio] = useState(evento.horaInicio);
  const [horaFim, setHoraFim] = useState(evento.horaFim);
  const [local, setLocal] = useState(evento.local);
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState(evento.cidade);
  const [estado, setEstado] = useState(evento.estado);
  const [endereco, setEndereco] = useState(evento.endereco);
  const [bairro, setBairro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [clienteId, setClienteId] = useState(evento.cliente.id);
  const [comercialId, setComercialId] = useState(evento.comercial.id);
  const [descricao, setDescricao] = useState(evento.descricao || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(evento.tags);

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
        
        const enderecoCompleto = `${dados.logradouro}${dados.bairro ? ', ' + dados.bairro : ''}`;
        setEndereco(enderecoCompleto);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!clienteId || !comercialId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um cliente e um comercial.',
        variant: 'destructive',
      });
      return;
    }

    if (dataFim && dataInicio && dataFim < dataInicio) {
      toast({
        title: 'Data inválida',
        description: 'A data de fim não pode ser anterior à data de início.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const dadosAtualizados: Partial<Evento> = {
        nome,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        local,
        cidade,
        estado,
        endereco,
        descricao,
        tags,
        clienteId,
        comercialId,
      } as any;

      await onSave(dadosAtualizados);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar evento',
        description: error.message || 'Ocorreu um erro ao atualizar o evento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input 
              id="dataInicio" 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="dataFim">Data de Término *</Label>
            <Input 
              id="dataFim" 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="horaInicio">Hora de Início *</Label>
            <Input 
              id="horaInicio" 
              type="time" 
              value={horaInicio} 
              onChange={(e) => setHoraInicio(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="horaFim">Hora de Término *</Label>
            <Input 
              id="horaFim" 
              type="time" 
              value={horaFim} 
              onChange={(e) => setHoraFim(e.target.value)} 
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
            />
            {loadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Digite o CEP para buscar automaticamente
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
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
              placeholder="Ex: MT"
              maxLength={2}
              required 
            />
          </div>
        </div>

        <div>
          <Label htmlFor="endereco">Endereço Completo *</Label>
          <Input 
            id="endereco" 
            value={endereco} 
            onChange={(e) => setEndereco(e.target.value)} 
            placeholder="Ex: Rua das Flores, 123 - Centro"
            required 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Você pode editar o endereço mesmo após buscar o CEP
          </p>
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
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <XCircle className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
