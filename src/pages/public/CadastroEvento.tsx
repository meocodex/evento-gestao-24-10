import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Beer, Zap, Info, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCadastros } from '@/hooks/cadastros';
import { TipoEvento, SetorEvento, TipoIngresso } from '@/types/eventos';
import { estados } from '@/lib/validations/cliente';

export default function CadastroEvento() {
  const navigate = useNavigate();
  const { criarCadastro } = useCadastros();
  const [step, setStep] = useState(1);
  const [tipoEvento, setTipoEvento] = useState<TipoEvento | null>(null);
  const [loading, setLoading] = useState(false);

  // Dados do evento
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [local, setLocal] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Dados do produtor
  const [produtorNome, setProdutorNome] = useState('');
  const [produtorDocumento, setProdutorDocumento] = useState('');
  const [produtorTelefone, setProdutorTelefone] = useState('');
  const [produtorWhatsapp, setProdutorWhatsapp] = useState('');
  const [produtorEmail, setProdutorEmail] = useState('');

  // Honeypot anti-bot (campo oculto que humanos não preenchem)
  const [honeypot, setHoneypot] = useState('');

  // Configuração de Ingresso
  const [setores, setSetores] = useState<SetorEvento[]>([]);

  // Configuração de Bar
  const [quantidadeMaquinas, setQuantidadeMaquinas] = useState(1);
  const [quantidadeBares, setQuantidadeBares] = useState(1);
  const [temCardapio, setTemCardapio] = useState(false);

  const handleSubmit = async () => {
    // Proteção anti-bot: se honeypot foi preenchido, é um bot
    if (honeypot) {
      console.warn('Bot detected - honeypot filled');
      return; // Silently fail for bots
    }

    setLoading(true);
    try {
      const protocolo = await criarCadastro.mutateAsync({
        tipoEvento: tipoEvento!,
        nome,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        local,
        endereco,
        cidade,
        estado,
        produtor: {
          nome: produtorNome,
          documento: produtorDocumento,
          telefone: produtorTelefone,
          whatsapp: produtorWhatsapp,
          email: produtorEmail,
        },
        configuracaoIngresso: (tipoEvento === 'ingresso' || tipoEvento === 'hibrido') ? {
          setores,
        } : undefined,
        configuracaoBar: (tipoEvento === 'bar' || tipoEvento === 'hibrido') ? {
          quantidadeMaquinas,
          quantidadeBares,
          temCardapio,
        } : undefined,
      });

      navigate(`/cadastro-evento/${protocolo}`);
    } finally {
      setLoading(false);
    }
  };

  const adicionarSetor = () => {
    setSetores([...setores, {
      id: `setor-${Date.now()}`,
      nome: '',
      capacidade: 0,
      tiposIngresso: [],
    }]);
  };

  const adicionarTipoIngresso = (setorId: string) => {
    setSetores(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: [...s.tiposIngresso, {
        id: `tipo-${Date.now()}`,
        nome: '',
        lotes: [],
      }],
    } : s));
  };

  // Passo 1: Escolher tipo de evento
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">Cadastro de Evento</CardTitle>
            <CardDescription>Qual tipo de evento você quer criar?</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-40 flex flex-col gap-3 hover:border-primary"
              onClick={() => { setTipoEvento('ingresso'); setStep(2); }}
            >
              <Ticket className="h-12 w-12" />
              <span className="text-lg font-medium">Evento com Ingresso</span>
            </Button>
            <Button
              variant="outline"
              className="h-40 flex flex-col gap-3 hover:border-primary"
              onClick={() => { setTipoEvento('bar'); setStep(2); }}
            >
              <Beer className="h-12 w-12" />
              <span className="text-lg font-medium">Evento de Bar</span>
            </Button>
            <Button
              variant="outline"
              className="h-40 flex flex-col gap-3 hover:border-primary"
              onClick={() => { setTipoEvento('hibrido'); setStep(2); }}
            >
              <Zap className="h-12 w-12" />
              <span className="text-lg font-medium">Híbrido (Ambos)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Passo 2: Dados básicos do evento
  if (step === 2) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Evento</CardTitle>
              <CardDescription>Passo 2 de 6</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Evento</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div>
                  <Label>Data de Fim</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Hora de Início</Label>
                  <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </div>
                <div>
                  <Label>Hora de Fim</Label>
                  <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Local</Label>
                <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Nome do local" />
              </div>

              <div>
                <Label>Endereço Completo</Label>
                <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => setStep(3)} disabled={!nome || !dataInicio}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 3: Dados do produtor
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Produtor</CardTitle>
              <CardDescription>Passo 3 de 6</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input value={produtorNome} onChange={(e) => setProdutorNome(e.target.value)} />
              </div>

              <div>
                <Label>CPF ou CNPJ</Label>
                <Input value={produtorDocumento} onChange={(e) => setProdutorDocumento(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input value={produtorTelefone} onChange={(e) => setProdutorTelefone(e.target.value)} />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={produtorWhatsapp} onChange={(e) => setProdutorWhatsapp(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>E-mail</Label>
                <Input type="email" value={produtorEmail} onChange={(e) => setProdutorEmail(e.target.value)} />
              </div>

              {/* Honeypot field - escondido do usuário, mas visível para bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website (não preencha)</label>
                <Input
                  id="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => setStep(4)} disabled={!produtorNome || !produtorEmail}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 4: Configurações específicas (Ingresso ou Bar)
  if (step === 4) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {tipoEvento === 'bar' ? 'Configuração do Bar' : 'Setores e Ingressos'}
              </CardTitle>
              <CardDescription>Passo 4 de 6</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Configure os setores do seu evento e os tipos de ingressos para cada setor
                    </AlertDescription>
                  </Alert>

                  <Button onClick={adicionarSetor} className="w-full">
                    + Adicionar Setor
                  </Button>

                  {setores.map((setor, idx) => (
                    <Card key={setor.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Setor {idx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nome do Setor</Label>
                            <Input
                              value={setor.nome}
                              onChange={(e) => setSetores(setores.map(s => 
                                s.id === setor.id ? { ...s, nome: e.target.value } : s
                              ))}
                              placeholder="Ex: Pista, Camarote"
                            />
                          </div>
                          <div>
                            <Label>Capacidade</Label>
                            <Input
                              type="number"
                              value={setor.capacidade}
                              onChange={(e) => setSetores(setores.map(s => 
                                s.id === setor.id ? { ...s, capacidade: Number(e.target.value) } : s
                              ))}
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarTipoIngresso(setor.id)}
                        >
                          + Adicionar Tipo de Ingresso
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(tipoEvento === 'bar' || tipoEvento === 'hibrido') && (
                <div className="space-y-4">
                  <div>
                    <Label>Quantas máquinas de bar você precisa?</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantidadeMaquinas}
                      onChange={(e) => setQuantidadeMaquinas(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Quantos bares terá no local?</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantidadeBares}
                      onChange={(e) => setQuantidadeBares(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={temCardapio}
                      onCheckedChange={(checked) => setTemCardapio(checked as boolean)}
                    />
                    <Label>Já possui cardápio definido</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => setStep(5)}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 5: Observações adicionais
  if (step === 5) {
    const [observacoes, setObservacoes] = useState('');

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>Passo 5 de 6</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Observações ou informações importantes</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva detalhes importantes sobre o evento..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => setStep(6)}>
              Revisar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Passo 6: Revisão final
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revisão Final</CardTitle>
            <CardDescription>Passo 6 de 6 - Confira os dados antes de enviar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Dados do Evento</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Nome:</dt>
                <dd className="font-medium">{nome}</dd>
                <dt className="text-muted-foreground">Data:</dt>
                <dd className="font-medium">{dataInicio} a {dataFim}</dd>
                <dt className="text-muted-foreground">Local:</dt>
                <dd className="font-medium">{local}</dd>
                <dt className="text-muted-foreground">Tipo:</dt>
                <dd className="font-medium capitalize">{tipoEvento}</dd>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Dados do Produtor</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Nome:</dt>
                <dd className="font-medium">{produtorNome}</dd>
                <dt className="text-muted-foreground">E-mail:</dt>
                <dd className="font-medium">{produtorEmail}</dd>
                <dt className="text-muted-foreground">WhatsApp:</dt>
                <dd className="font-medium">{produtorWhatsapp}</dd>
              </dl>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ao enviar, você receberá um protocolo para acompanhar o status do seu cadastro.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(5)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Cadastro'}
          </Button>
        </div>
      </div>
    </div>
  );
}
