import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/hooks/contratos';
import { useClientes } from '@/hooks/clientes';
import { ItemProposta } from '@/types/contratos';
import { ItemPropostaForm } from './ItemPropostaForm';
import { UploadPapelTimbrado } from './UploadPapelTimbrado';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NovaPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaPropostaDialog({ open, onOpenChange }: NovaPropostaDialogProps) {
  const { criarContrato, templates } = useContratos();
  const { clientes } = useClientes();
  const [step, setStep] = useState(1);

  // Passo 1: Dados Básicos
  const [clienteId, setClienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [validade, setValidade] = useState('');
  const [templateId, setTemplateId] = useState('');

  // Passo 2: Dados do Evento
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [local, setLocal] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [descricaoEvento, setDescricaoEvento] = useState('');

  // Passo 3: Itens
  const [itens, setItens] = useState<ItemProposta[]>([]);
  const [editandoItem, setEditandoItem] = useState<ItemProposta | null>(null);
  const [mostrarFormItem, setMostrarFormItem] = useState(false);

  // Passo 4: Condições Comerciais
  const [condicoesPagamento, setCondicoesPagamento] = useState('');
  const [prazoExecucao, setPrazoExecucao] = useState('');
  const [garantia, setGarantia] = useState('');
  const [observacoesComerciais, setObservacoesComerciais] = useState('');

  // Passo 5: Papel Timbrado
  const [papelTimbrado, setPapelTimbrado] = useState<string>();

  const handleSalvarItem = (item: ItemProposta) => {
    if (editandoItem) {
      setItens(itens.map(i => i.id === item.id ? item : i));
    } else {
      setItens([...itens, item]);
    }
    setEditandoItem(null);
    setMostrarFormItem(false);
  };

  const handleRemoverItem = (id: string) => {
    setItens(itens.filter(i => i.id !== id));
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  };

  const handleSubmit = async () => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    await criarContrato.mutateAsync({
      templateId,
      numero: `PROP-${Date.now()}`,
      clienteId,
      titulo,
      tipo: 'evento',
      status: 'proposta',
      conteudo: template.conteudo,
      valor: calcularTotal(),
      itens,
      validade,
      condicoesPagamento,
      prazoExecucao,
      garantia,
      observacoesComerciais,
      dadosEvento: {
        nome: nomeEvento,
        dataInicio,
        dataFim,
        local,
        cidade,
        estado,
        descricao: descricaoEvento,
      },
      assinaturas: [
        {
          parte: 'empresa',
          nome: 'Empresa',
          email: 'empresa@exemplo.com',
          assinado: false,
        },
        {
          parte: 'cliente',
          nome: clientes.find(c => c.id === clienteId)?.nome || '',
          email: clientes.find(c => c.id === clienteId)?.email || '',
          assinado: false,
        },
      ],
      anexos: [],
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStep(1);
    setClienteId('');
    setTitulo('');
    setValidade('');
    setTemplateId('');
    setNomeEvento('');
    setDataInicio('');
    setDataFim('');
    setLocal('');
    setCidade('');
    setEstado('');
    setDescricaoEvento('');
    setItens([]);
    setCondicoesPagamento('');
    setPrazoExecucao('');
    setGarantia('');
    setObservacoesComerciais('');
    setPapelTimbrado(undefined);
  };

  const podeContinuar = () => {
    if (step === 1) return clienteId && titulo && validade && templateId;
    if (step === 2) return nomeEvento && dataInicio && dataFim && local && cidade && estado;
    if (step === 3) return itens.length > 0;
    if (step === 4) return true;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Proposta Comercial - Passo {step} de 5</DialogTitle>
        </DialogHeader>

        {/* Passo 1: Dados Básicos */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título da Proposta *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Proposta de Iluminação para Casamento"
              />
            </div>

            <div>
              <Label>Validade da Proposta *</Label>
              <Input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>

            <div>
              <Label>Template *</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.status === 'ativo').map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Passo 2: Dados do Evento */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Nome do Evento *</Label>
              <Input
                value={nomeEvento}
                onChange={(e) => setNomeEvento(e.target.value)}
                placeholder="Ex: Casamento João e Maria"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div>
                <Label>Data Fim *</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Local *</Label>
              <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Buffet Estrela Dourada"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Cidade *</Label>
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Cuiabá"
                />
              </div>
              <div>
                <Label>Estado *</Label>
                <Input
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  maxLength={2}
                  placeholder="MT"
                />
              </div>
            </div>

            <div>
              <Label>Descrição do Evento</Label>
              <Textarea
                value={descricaoEvento}
                onChange={(e) => setDescricaoEvento(e.target.value)}
                rows={3}
                placeholder="Detalhes sobre o evento..."
              />
            </div>
          </div>
        )}

        {/* Passo 3: Itens */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Itens da Proposta</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione os serviços e produtos que serão cobrados
                </p>
              </div>
              {!mostrarFormItem && (
                <Button onClick={() => setMostrarFormItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              )}
            </div>

            {mostrarFormItem && (
              <ItemPropostaForm
                item={editandoItem || undefined}
                onSave={handleSalvarItem}
                onCancel={() => {
                  setMostrarFormItem(false);
                  setEditandoItem(null);
                }}
              />
            )}

            {itens.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Tipo</th>
                      <th className="text-left p-3 text-sm font-medium">Descrição</th>
                      <th className="text-right p-3 text-sm font-medium">Qtd</th>
                      <th className="text-right p-3 text-sm font-medium">Valor Unit.</th>
                      <th className="text-right p-3 text-sm font-medium">Total</th>
                      <th className="text-center p-3 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item) => (
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
                        <td className="p-3 text-sm text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditandoItem(item);
                                setMostrarFormItem(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoverItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-semibold">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">Total Geral:</td>
                      <td className="p-3 text-right">
                        {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {itens.length === 0 && !mostrarFormItem && (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum item adicionado ainda</p>
                <Button onClick={() => setMostrarFormItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Passo 4: Condições Comerciais */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Condições de Pagamento</Label>
              <Textarea
                value={condicoesPagamento}
                onChange={(e) => setCondicoesPagamento(e.target.value)}
                rows={4}
                placeholder="Ex: 50% de entrada e 50% após o evento"
              />
            </div>

            <div>
              <Label>Prazo de Execução</Label>
              <Input
                value={prazoExecucao}
                onChange={(e) => setPrazoExecucao(e.target.value)}
                placeholder="Ex: Montagem 1 dia antes, desmontagem 1 dia depois"
              />
            </div>

            <div>
              <Label>Garantia</Label>
              <Input
                value={garantia}
                onChange={(e) => setGarantia(e.target.value)}
                placeholder="Ex: 90 dias para defeitos de fabricação"
              />
            </div>

            <div>
              <Label>Observações Comerciais</Label>
              <Textarea
                value={observacoesComerciais}
                onChange={(e) => setObservacoesComerciais(e.target.value)}
                rows={3}
                placeholder="Observações adicionais sobre a proposta..."
              />
            </div>
          </div>
        )}

        {/* Passo 5: Papel Timbrado e Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <UploadPapelTimbrado 
              value={papelTimbrado}
              onChange={setPapelTimbrado}
            />

            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold mb-3">Resumo da Proposta</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{clientes.find(c => c.id === clienteId)?.nome}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Evento:</span>
                  <span>{nomeEvento}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Total de itens:</span>
                  <span>{itens.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Valor total:</span>
                  <span className="font-semibold">
                    {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Validade:</span>
                  <span>{new Date(validade).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
            {step > 1 ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </>
            ) : 'Cancelar'}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!podeContinuar()}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!podeContinuar()}
            >
              Gerar Proposta
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}