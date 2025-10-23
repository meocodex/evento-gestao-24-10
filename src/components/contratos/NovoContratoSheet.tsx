import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/hooks/contratos';
import { useClientes } from '@/hooks/clientes';
import { useEventos } from '@/hooks/eventos';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface NovoContratoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoContratoSheet({ open, onOpenChange }: NovoContratoSheetProps) {
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

  const handleSubmit = async () => {
    await criarContrato({
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[900px] overflow-y-auto">
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">Novo Contrato</SheetTitle>
          <SheetDescription className="text-navy-500">
            Passo {step} de 5: {steps[step - 1].title}
          </SheetDescription>
        </SheetHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs">
            {steps.map((s) => (
              <span
                key={s.number}
                className={step >= s.number ? 'text-navy-700 font-medium' : 'text-navy-400'}
              >
                {s.title}
              </span>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </div>

        {/* Step 1: Escolher Template */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-800">Escolha um template</h3>
            <div className="grid gap-3">
              {templates.filter(t => t.status === 'ativo').map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    templateId === template.id ? 'border-navy-600 bg-navy-50' : 'border-navy-100 hover:border-navy-300'
                  }`}
                  onClick={() => setTemplateId(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 bg-navy-100 rounded-lg">
                        <FileText className="h-5 w-5 text-navy-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">{template.nome}</h4>
                        <p className="text-sm text-navy-600 mt-1">{template.descricao}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="capitalize border-navy-300 text-navy-700">{template.tipo}</Badge>
                          <Badge variant="secondary" className="bg-navy-100 text-navy-800">v{template.versao}</Badge>
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
            <h3 className="font-semibold text-navy-800">Vincule o contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-navy-700">Cliente (opcional)</Label>
                <Select
                  value={clienteId}
                  onValueChange={(value) => setClienteId(value)}
                >
                  <SelectTrigger className="border-navy-200">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-navy-700">Evento (opcional)</Label>
                <Select
                  value={eventoId}
                  onValueChange={(value) => setEventoId(value)}
                >
                  <SelectTrigger className="border-navy-200">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos.map((evento) => (
                      <SelectItem key={evento.id} value={evento.id}>
                        {evento.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preencher Dados */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-800">Preencha os dados do contrato</h3>
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-navy-700">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="border-navy-200 focus:border-navy-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-navy-700">Valor (opcional)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-navy-700">Data de Início (opcional)</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-navy-700">Data de Fim (opcional)</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>
            {templateSelecionado?.variaveis && templateSelecionado.variaveis.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-navy-700">Variáveis do template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templateSelecionado.variaveis.map((variavel) => (
                    <div key={variavel} className="space-y-2">
                      <Label htmlFor={`variavel-${variavel}`} className="text-navy-700">{variavel}</Label>
                      <Input
                        id={`variavel-${variavel}`}
                        value={variaveis[variavel] || ''}
                        onChange={(e) => setVariaveis({ ...variaveis, [variavel]: e.target.value })}
                        className="border-navy-200 focus:border-navy-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-800">Preview do contrato</h3>
            <div className="rounded-lg border border-navy-200 p-4 shadow-sm">
              {templateSelecionado ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-navy-700">{titulo || templateSelecionado.nome}</h4>
                  <div className="text-sm text-navy-600 whitespace-pre-line">
                    {preencherConteudo()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-navy-600">Nenhum template selecionado.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Signatários */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-800">Defina os signatários</h3>
            {assinaturas.map((assinatura, index) => (
              <div key={index} className="space-y-2 border border-navy-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-navy-700">Parte</Label>
                    <Input
                      type="text"
                      value={assinatura.parte}
                      onChange={(e) => atualizarAssinatura(index, 'parte', e.target.value)}
                      placeholder="Ex: Contratante"
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                  <div>
                    <Label className="text-navy-700">Nome</Label>
                    <Input
                      type="text"
                      value={assinatura.nome}
                      onChange={(e) => atualizarAssinatura(index, 'nome', e.target.value)}
                      placeholder="Nome completo"
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                  <div>
                    <Label className="text-navy-700">Email</Label>
                    <Input
                      type="email"
                      value={assinatura.email}
                      onChange={(e) => atualizarAssinatura(index, 'email', e.target.value)}
                      placeholder="Email válido"
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removerAssinatura(index)}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={adicionarAssinatura}>
              Adicionar Signatário
            </Button>
          </div>
        )}

        {/* Footer Buttons */}
        <SheetFooter className="border-t border-navy-100 pt-6 mt-6">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
