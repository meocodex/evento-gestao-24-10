import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/contexts/ContratosContext';
import { useClientes } from '@/contexts/ClientesContext';
import { useEventos } from '@/contexts/EventosContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface NovoContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoContratoDialog({ open, onOpenChange }: NovoContratoDialogProps) {
  const { templates, criarContrato } = useContratos();
  const { clientes } = useClientes();
  const { eventos } = useEventos();
  
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [variaveis, setVariaveis] = useState<Record<string, string>>({});
  const [assinaturas, setAssinaturas] = useState<Array<{ parte: string; nome: string; email: string }>>([]);

  const templateSelecionado = templates.find(t => t.id === templateId);
  const clienteSelecionado = clientes.find(c => c.id === clienteId);
  const eventoSelecionado = eventos.find(e => e.id === eventoId);

  const steps = [
    { number: 1, title: 'Escolher Template' },
    { number: 2, title: 'Vincular' },
    { number: 3, title: 'Preencher Dados' },
    { number: 4, title: 'Preview' },
    { number: 5, title: 'Signatários' },
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    criarContrato({
      templateId,
      numero: `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      clienteId: clienteId || undefined,
      eventoId: eventoId || undefined,
      titulo,
      tipo: templateSelecionado?.tipo || 'outros',
      status: 'rascunho',
      conteudo: preencherConteudo(),
      valor: valor ? parseFloat(valor) : undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      assinaturas: assinaturas.map(a => ({ ...a, assinado: false })),
      anexos: [],
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStep(1);
    setTemplateId('');
    setClienteId('');
    setEventoId('');
    setTitulo('');
    setValor('');
    setDataInicio('');
    setDataFim('');
    setConteudo('');
    setVariaveis({});
    setAssinaturas([]);
  };

  const preencherConteudo = () => {
    if (!templateSelecionado) return '';
    let resultado = templateSelecionado.conteudo;
    Object.entries(variaveis).forEach(([key, value]) => {
      resultado = resultado.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return resultado;
  };

  const adicionarAssinatura = () => {
    setAssinaturas([...assinaturas, { parte: '', nome: '', email: '' }]);
  };

  const atualizarAssinatura = (index: number, field: string, value: string) => {
    const novasAssinaturas = [...assinaturas];
    novasAssinaturas[index] = { ...novasAssinaturas[index], [field]: value };
    setAssinaturas(novasAssinaturas);
  };

  const removerAssinatura = (index: number) => {
    setAssinaturas(assinaturas.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            {steps.map((s) => (
              <span
                key={s.number}
                className={step >= s.number ? 'text-primary font-medium' : 'text-muted-foreground'}
              >
                {s.title}
              </span>
            ))}
          </div>
          <Progress value={(step / 5) * 100} />
        </div>

        {/* Step 1: Escolher Template */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Escolha um template</h3>
            <div className="grid gap-3">
              {templates.filter(t => t.status === 'ativo').map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    templateId === template.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setTemplateId(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-medium">{template.nome}</h4>
                        <p className="text-sm text-muted-foreground">{template.descricao}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{template.tipo}</Badge>
                          <Badge variant="secondary">v{template.versao}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Vincular */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Vincular a Cliente e/ou Evento</h3>
            <div>
              <Label htmlFor="titulo">Título do Contrato</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Contrato Tech Summit 2024"
              />
            </div>
            <div>
              <Label htmlFor="cliente">Cliente (opcional)</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evento">Evento (opcional)</Label>
              <Select value={eventoId} onValueChange={setEventoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {eventos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="valor">Valor Total (opcional)</Label>
              <Input
                id="valor"
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {/* Step 3: Preencher Dados */}
        {step === 3 && templateSelecionado && (
          <div className="space-y-4">
            <h3 className="font-semibold">Preencher Variáveis do Template</h3>
            <div className="grid gap-3">
              {templateSelecionado.variaveis.map((variavel) => (
                <div key={variavel}>
                  <Label htmlFor={variavel}>{variavel.replace(/_/g, ' ').toUpperCase()}</Label>
                  <Input
                    id={variavel}
                    value={variaveis[variavel] || ''}
                    onChange={(e) => setVariaveis({ ...variaveis, [variavel]: e.target.value })}
                    placeholder={`Digite ${variavel}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Preview do Contrato</h3>
            <div className="bg-muted/30 p-6 rounded-md border max-h-[500px] overflow-y-auto">
              <div className="text-sm whitespace-pre-wrap">{preencherConteudo()}</div>
            </div>
          </div>
        )}

        {/* Step 5: Signatários */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Definir Signatários</h3>
              <Button type="button" variant="outline" size="sm" onClick={adicionarAssinatura}>
                + Adicionar Signatário
              </Button>
            </div>
            <div className="space-y-3">
              {assinaturas.map((assinatura, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Signatário {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerAssinatura(index)}
                    >
                      Remover
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Parte (Ex: Contratante)"
                      value={assinatura.parte}
                      onChange={(e) => atualizarAssinatura(index, 'parte', e.target.value)}
                    />
                    <Input
                      placeholder="Nome completo"
                      value={assinatura.nome}
                      onChange={(e) => atualizarAssinatura(index, 'nome', e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={assinatura.email}
                      onChange={(e) => atualizarAssinatura(index, 'email', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {assinaturas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum signatário adicionado
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {step < 5 ? (
              <Button onClick={handleNext} disabled={step === 1 && !templateId}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!titulo}>
                Criar Contrato
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
