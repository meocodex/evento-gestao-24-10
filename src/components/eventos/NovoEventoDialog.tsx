import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ClienteSelect } from './ClienteSelect';
import { ComercialSelect } from './ComercialSelect';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useEventos } from '@/hooks/eventos';

interface NovoEventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventoCreated: () => void;
}

export function NovoEventoDialog({ open, onOpenChange, onEventoCreated }: NovoEventoDialogProps) {
  const { toast } = useToast();
  const { criarEvento } = useEventos();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { buscarCEP: buscarCepApi } = await import('@/lib/api/viacep');
      const dados = await buscarCepApi(cepLimpo);
      
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
      setIsSubmitting(true);

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
      });
      
      // Reset form
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
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
                />
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleBuscarCEP}
                  disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
                >
                  {loadingCep ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
