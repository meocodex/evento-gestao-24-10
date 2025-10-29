import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Beer, Zap, Info, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCadastros } from '@/hooks/cadastros';
import { TipoEvento, SetorEvento, PontoVenda, EstabelecimentoBar, TipoIngresso } from '@/types/eventos';
import { estados, formatarDocumento, formatarTelefone, formatarCEP, validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

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
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [buscandoCEPEvento, setBuscandoCEPEvento] = useState(false);

  // Dados do produtor
  const [produtorNome, setProdutorNome] = useState('');
  const [produtorTipo, setProdutorTipo] = useState<'CPF' | 'CNPJ'>('CPF');
  const [produtorDocumento, setProdutorDocumento] = useState('');
  const [produtorTelefone, setProdutorTelefone] = useState('');
  const [produtorWhatsapp, setProdutorWhatsapp] = useState('');
  const [produtorEmail, setProdutorEmail] = useState('');
  
  // Endereço do produtor
  const [produtorCep, setProdutorCep] = useState('');
  const [produtorLogradouro, setProdutorLogradouro] = useState('');
  const [produtorNumero, setProdutorNumero] = useState('');
  const [produtorComplemento, setProdutorComplemento] = useState('');
  const [produtorBairro, setProdutorBairro] = useState('');
  const [produtorCidade, setProdutorCidade] = useState('');
  const [produtorEstado, setProdutorEstado] = useState('');
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  // Responsável Legal (CNPJ)
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelCpf, setResponsavelCpf] = useState('');
  const [responsavelDataNascimento, setResponsavelDataNascimento] = useState('');

  // Honeypot anti-bot (campo oculto que humanos não preenchem)
  const [honeypot, setHoneypot] = useState('');
  
  // Observações
  const [observacoes, setObservacoes] = useState('');
  
  // Pontos de Venda (Ingresso)
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [pdvCepBusca, setPdvCepBusca] = useState<Record<string, boolean>>({});
  
  // Banners e Mapa (Ingresso)
  const [bannerPrincipal, setBannerPrincipal] = useState('');
  const [bannerMobile, setBannerMobile] = useState('');
  const [bannerSite, setBannerSite] = useState('');
  const [mapaEvento, setMapaEvento] = useState('');
  
  // Estabelecimentos de Bar
  const [estabelecimentosBares, setEstabelecimentosBares] = useState<EstabelecimentoBar[]>([
    { id: '1', nome: 'Bar Principal', quantidadeMaquinas: 1 }
  ]);
  const [mapaLocal, setMapaLocal] = useState('');
  
  // Busca automática de endereço por CEP do produtor
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (produtorCep.replace(/\D/g, '').length === 8) {
        setBuscandoCEP(true);
        try {
          const endereco = await buscarEnderecoPorCEP(produtorCep);
          if (endereco) {
            setProdutorLogradouro(endereco.logradouro);
            setProdutorBairro(endereco.bairro);
            setProdutorCidade(endereco.localidade);
            setProdutorEstado(endereco.uf);
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
        } finally {
          setBuscandoCEP(false);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [produtorCep]);

  // Busca automática de endereço por CEP do evento
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (cep.replace(/\D/g, '').length === 8) {
        setBuscandoCEPEvento(true);
        try {
          const endereco = await buscarEnderecoPorCEP(cep);
          if (endereco) {
            setLogradouro(endereco.logradouro);
            setBairro(endereco.bairro);
            setCidade(endereco.localidade);
            setEstado(endereco.uf);
            toast({
              title: 'CEP encontrado!',
              description: 'Endereço preenchido automaticamente.',
            });
          }
        } catch (error) {
          console.error('Erro ao buscar CEP do evento:', error);
          toast({
            title: 'CEP não encontrado',
            description: 'Preencha o endereço manualmente.',
            variant: 'destructive',
          });
        } finally {
          setBuscandoCEPEvento(false);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [cep, toast]);

  // Configuração de Ingresso
  const [setores, setSetores] = useState<SetorEvento[]>([]);

  const handleSubmit = async () => {
    // Proteção anti-bot: se honeypot foi preenchido, é um bot
    if (honeypot) {
      console.warn('Bot detected - honeypot filled');
      return; // Silently fail for bots
    }

    // Validar documento
    const documentoLimpo = produtorDocumento.replace(/\D/g, '');
    
    if (produtorTipo === 'CPF' && !validarCPF(documentoLimpo)) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, verifique o número do CPF informado.',
        variant: 'destructive',
      });
      return;
    }
    
    if (produtorTipo === 'CNPJ' && !validarCNPJ(documentoLimpo)) {
      toast({
        title: 'CNPJ inválido',
        description: 'Por favor, verifique o número do CNPJ informado.',
        variant: 'destructive',
      });
      return;
    }

    // Validar responsável legal se for CNPJ
    if (produtorTipo === 'CNPJ') {
      const cpfResponsavel = responsavelCpf.replace(/\D/g, '');
      if (!validarCPF(cpfResponsavel)) {
        toast({
          title: 'CPF do responsável legal inválido',
          description: 'Por favor, verifique o número do CPF informado.',
          variant: 'destructive',
        });
        return;
      }

      // Validar idade mínima (18 anos)
      const dataNasc = new Date(responsavelDataNascimento);
      const hoje = new Date();
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth();
      const diaAtual = hoje.getDate();
      const mesNasc = dataNasc.getMonth();
      const diaNasc = dataNasc.getDate();
      
      const idadeReal = mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc) 
        ? idade - 1 
        : idade;

      if (idadeReal < 18) {
        toast({
          title: 'Responsável legal menor de idade',
          description: 'O responsável legal deve ter no mínimo 18 anos.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Montar objeto de responsável legal
      const responsavelLegal = produtorTipo === 'CNPJ' ? {
        nome: responsavelNome,
        cpf: responsavelCpf.replace(/\D/g, ''),
        dataNascimento: responsavelDataNascimento,
      } : undefined;

      // Montar configuração de ingresso
      const configuracaoIngresso = (tipoEvento === 'ingresso' || tipoEvento === 'hibrido') ? {
        setores: setores,
        pontosVenda: pontosVenda,
        mapaEvento: mapaEvento || undefined,
        banners: {
          bannerPrincipal: bannerPrincipal || undefined,
          bannerMobile: bannerMobile || undefined,
          bannerSite: bannerSite || undefined,
        },
      } : undefined;

      // Montar configuração de bar
      const configuracaoBar = (tipoEvento === 'bar' || tipoEvento === 'hibrido') ? {
        estabelecimentos: estabelecimentosBares,
        mapaLocal: mapaLocal || undefined,
      } : undefined;

      const protocolo = await criarCadastro.mutateAsync({
        tipoEvento: tipoEvento!,
        nome,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        local,
        endereco: `${logradouro}, ${numero}${complemento ? ', ' + complemento : ''} - ${bairro}`,
        cidade,
        estado,
        observacoes,
        produtor: {
          nome: produtorNome,
          tipo: produtorTipo,
          documento: produtorDocumento,
          telefone: produtorTelefone,
          whatsapp: produtorWhatsapp,
          email: produtorEmail,
          endereco: {
            cep: produtorCep,
            logradouro: produtorLogradouro,
            numero: produtorNumero,
            complemento: produtorComplemento,
            bairro: produtorBairro,
            cidade: produtorCidade,
            estado: produtorEstado,
          },
          responsavelLegal,
        },
        configuracaoIngresso,
        configuracaoBar,
      });

      navigate(`/cadastro-evento/${protocolo}`);
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar evento',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
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

  const removerSetor = (setorId: string) => {
    setSetores(setores.filter(s => s.id !== setorId));
  };

  const atualizarSetor = (setorId: string, campo: string, valor: any) => {
    setSetores(setores.map(s => 
      s.id === setorId ? { ...s, [campo]: valor } : s
    ));
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

  const removerTipoIngresso = (setorId: string, tipoId: string) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.filter(t => t.id !== tipoId),
        };
      }
      return s;
    }));
  };

  const atualizarTipoIngresso = (setorId: string, tipoId: string, campo: string, valor: any) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.map(t =>
            t.id === tipoId ? { ...t, [campo]: valor } : t
          ),
        };
      }
      return s;
    }));
  };

  const atualizarLote = (
    setorId: string, 
    tipoId: string, 
    numeroLote: number, 
    campo: string, 
    valor: any
  ) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.map(t => {
            if (t.id === tipoId) {
              const loteExistente = t.lotes.findIndex(l => l.numero === numeroLote);
              
              if (loteExistente >= 0) {
                const novosLotes = [...t.lotes];
                novosLotes[loteExistente] = {
                  ...novosLotes[loteExistente],
                  [campo]: valor,
                };
                return { ...t, lotes: novosLotes };
              } else {
                return {
                  ...t,
                  lotes: [
                    ...t.lotes,
                    {
                      numero: numeroLote as 1 | 2 | 3 | 4,
                      quantidade: campo === 'quantidade' ? valor : 0,
                      preco: campo === 'preco' ? valor : 0,
                      dataAberturaOnline: campo === 'dataAberturaOnline' ? valor : '',
                      dataAberturaPDV: campo === 'dataAberturaPDV' ? valor : '',
                      dataFechamentoOnline: campo === 'dataFechamentoOnline' ? valor : '',
                      dataFechamentoPDV: campo === 'dataFechamentoPDV' ? valor : '',
                    },
                  ],
                };
              }
            }
            return t;
          }),
        };
      }
      return s;
    }));
  };

  // Funções para PDVs
  const adicionarPontoVenda = () => {
    const novoPDV: PontoVenda = {
      id: Date.now().toString(),
      nome: '',
      responsavel: '',
      telefone: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
    };
    setPontosVenda([...pontosVenda, novoPDV]);
  };

  const removerPontoVenda = (pdvId: string) => {
    setPontosVenda(pontosVenda.filter(p => p.id !== pdvId));
  };

  const atualizarPDV = (pdvId: string, campo: string, valor: any) => {
    setPontosVenda(pontosVenda.map(p => {
      if (p.id === pdvId) {
        if (campo.startsWith('endereco.')) {
          const campoEndereco = campo.split('.')[1];
          return {
            ...p,
            endereco: {
              ...p.endereco,
              [campoEndereco]: valor,
            },
          };
        }
        return { ...p, [campo]: valor };
      }
      return p;
    }));
  };

  const buscarCEPParaPDV = async (pdvId: string, cep: string) => {
    setPdvCepBusca({ ...pdvCepBusca, [pdvId]: true });
    try {
      const endereco = await buscarEnderecoPorCEP(cep);
      if (endereco) {
        setPontosVenda(pontosVenda.map(p => {
          if (p.id === pdvId) {
            return {
              ...p,
              endereco: {
                ...p.endereco,
                logradouro: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.localidade,
                estado: endereco.uf,
              },
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP do PDV:', error);
    } finally {
      setPdvCepBusca({ ...pdvCepBusca, [pdvId]: false });
    }
  };

  // Funções para estabelecimentos de bar
  const adicionarEstabelecimento = () => {
    const novoEstab: EstabelecimentoBar = {
      id: Date.now().toString(),
      nome: '',
      quantidadeMaquinas: 1,
    };
    setEstabelecimentosBares([...estabelecimentosBares, novoEstab]);
  };

  const removerEstabelecimento = (estabId: string) => {
    setEstabelecimentosBares(estabelecimentosBares.filter(e => e.id !== estabId));
  };

  const atualizarEstabelecimento = (estabId: string, campo: string, valor: any) => {
    setEstabelecimentosBares(estabelecimentosBares.map(e =>
      e.id === estabId ? { ...e, [campo]: valor } : e
    ));
  };

  const copiarCardapio = (estabDestinoId: string, estabOrigemId: string) => {
    const origem = estabelecimentosBares.find(e => e.id === estabOrigemId);
    if (origem?.cardapioUrl) {
      setEstabelecimentosBares(estabelecimentosBares.map(e =>
        e.id === estabDestinoId ? { ...e, cardapioUrl: origem.cardapioUrl, copiadoDeId: estabOrigemId } : e
      ));
      toast({
        title: 'Cardápio copiado',
        description: 'Cardápio copiado com sucesso!',
      });
    }
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
              {/* Nome do Evento + Local */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Evento</Label>
                  <Input 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    maxLength={200}
                    placeholder="Festival de Verão 2025"
                  />
                </div>
                <div>
                  <Label>Local</Label>
                  <Input 
                    value={local} 
                    onChange={(e) => setLocal(e.target.value)} 
                    placeholder="Arena XYZ"
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Data Início + Data Fim + Hora Início + Hora Fim */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Data Início</Label>
                  <Input 
                    type="date" 
                    value={dataInicio} 
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input 
                    type="date" 
                    value={dataFim} 
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hora Início</Label>
                  <Input 
                    type="time" 
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Hora Fim</Label>
                  <Input 
                    type="time" 
                    value={horaFim} 
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </div>
              </div>

              {/* CEP + Logradouro + Número */}
              <div className="grid grid-cols-[140px_1fr_120px] gap-3">
                <div>
                  <Label>CEP</Label>
                  <div className="relative">
                    <Input
                      value={cep}
                      onChange={(e) => {
                        const formatted = formatarCEP(e.target.value);
                        setCep(formatted);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={buscandoCEPEvento}
                    />
                    {buscandoCEPEvento && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite o CEP
                  </p>
                </div>
                
                <div>
                  <Label>Logradouro</Label>
                  <Input 
                    value={logradouro} 
                    onChange={(e) => setLogradouro(e.target.value)} 
                    placeholder="Rua, Avenida..."
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label>Número *</Label>
                  <Input 
                    value={numero} 
                    onChange={(e) => setNumero(e.target.value)} 
                    placeholder="123"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Bairro + Complemento + Cidade + Estado */}
              <div className="grid grid-cols-2 lg:grid-cols-[1fr_180px_1fr_100px] gap-3">
                <div>
                  <Label>Bairro</Label>
                  <Input 
                    value={bairro} 
                    onChange={(e) => setBairro(e.target.value)} 
                    placeholder="Centro"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input 
                    value={complemento} 
                    onChange={(e) => setComplemento(e.target.value)} 
                    placeholder="Apt 101"
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input 
                    value={cidade} 
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
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
            <Button onClick={() => setStep(3)} disabled={!nome || !dataInicio || !logradouro || !numero || !bairro}>
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
                <Label>Tipo de Pessoa *</Label>
                <Select value={produtorTipo} onValueChange={(v) => setProdutorTipo(v as 'CPF' | 'CNPJ')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">Pessoa Física (CPF)</SelectItem>
                    <SelectItem value="CNPJ">Pessoa Jurídica (CNPJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{produtorTipo === 'CNPJ' ? 'Razão Social *' : 'Nome Completo *'}</Label>
                <Input value={produtorNome} onChange={(e) => setProdutorNome(e.target.value)} />
              </div>

              <div>
                <Label>{produtorTipo === 'CNPJ' ? 'CNPJ *' : 'CPF *'}</Label>
                <Input
                  value={produtorDocumento}
                  onChange={(e) => {
                    const formatted = formatarDocumento(e.target.value, produtorTipo);
                    setProdutorDocumento(formatted);
                  }}
                  placeholder={produtorTipo === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                  maxLength={produtorTipo === 'CNPJ' ? 18 : 14}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone *</Label>
                  <Input
                    value={produtorTelefone}
                    onChange={(e) => setProdutorTelefone(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={produtorWhatsapp}
                    onChange={(e) => setProdutorWhatsapp(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <Label>E-mail *</Label>
                <Input type="email" value={produtorEmail} onChange={(e) => setProdutorEmail(e.target.value)} />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Endereço</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>CEP *</Label>
                    <div className="relative">
                      <Input
                        value={produtorCep}
                        onChange={(e) => setProdutorCep(formatarCEP(e.target.value))}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={buscandoCEP}
                      />
                      {buscandoCEP && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Logradouro *</Label>
                      <Input value={produtorLogradouro} onChange={(e) => setProdutorLogradouro(e.target.value)} />
                    </div>
                    <div>
                      <Label>Número *</Label>
                      <Input value={produtorNumero} onChange={(e) => setProdutorNumero(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label>Complemento</Label>
                    <Input value={produtorComplemento} onChange={(e) => setProdutorComplemento(e.target.value)} placeholder="Apto, sala, etc" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Bairro *</Label>
                      <Input value={produtorBairro} onChange={(e) => setProdutorBairro(e.target.value)} />
                    </div>
                    <div>
                      <Label>Cidade *</Label>
                      <Input value={produtorCidade} onChange={(e) => setProdutorCidade(e.target.value)} />
                    </div>
                    <div>
                      <Label>UF *</Label>
                      <Select value={produtorEstado} onValueChange={setProdutorEstado}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map((uf) => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
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

              {/* Responsável Legal (obrigatório para CNPJ) */}
              {produtorTipo === 'CNPJ' && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4 text-amber-600">
                    ⚠️ Responsável Legal (Obrigatório para CNPJ)
                  </h3>
                  
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Para empresas (CNPJ), é obrigatório informar um responsável legal com CPF válido e maior de 18 anos
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label>Nome Completo do Responsável *</Label>
                      <Input 
                        value={responsavelNome} 
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>CPF do Responsável *</Label>
                        <Input
                          value={responsavelCpf}
                          onChange={(e) => {
                            const formatted = formatarDocumento(e.target.value, 'CPF');
                            setResponsavelCpf(formatted);
                          }}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>
                      <div>
                        <Label>Data de Nascimento *</Label>
                        <Input
                          type="date"
                          value={responsavelDataNascimento}
                          onChange={(e) => setResponsavelDataNascimento(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => setStep(4)} 
              disabled={
                !produtorNome || 
                !produtorDocumento || 
                !produtorEmail || 
                !produtorTelefone ||
                !produtorCep ||
                !produtorLogradouro ||
                !produtorNumero ||
                !produtorBairro ||
                !produtorCidade ||
                !produtorEstado ||
                (produtorTipo === 'CNPJ' && (!responsavelNome || !responsavelCpf || !responsavelDataNascimento))
              }
            >
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Estabelecimentos de Bar</h3>
                    <Button onClick={adicionarEstabelecimento} size="sm">
                      + Adicionar Estabelecimento
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Se houver múltiplos bares no local (Ex: Bar Central, Bar Arena), cadastre todos aqui
                    </AlertDescription>
                  </Alert>

                  {estabelecimentosBares.map((estab, idx) => (
                    <Card key={estab.id} className="border-amber-200">
                      <CardHeader>
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>Bar {idx + 1}: {estab.nome || 'Sem nome'}</span>
                          {estabelecimentosBares.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removerEstabelecimento(estab.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Nome do Estabelecimento *</Label>
                          <Input
                            value={estab.nome}
                            onChange={(e) => atualizarEstabelecimento(estab.id, 'nome', e.target.value)}
                            placeholder="Ex: Bar Central, Bar Arena"
                          />
                        </div>

                        <div>
                          <Label>Quantidade de Máquinas *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={estab.quantidadeMaquinas}
                            onChange={(e) => atualizarEstabelecimento(estab.id, 'quantidadeMaquinas', Number(e.target.value))}
                            placeholder="Quantas máquinas neste bar?"
                          />
                        </div>

                        <div>
                          <Label>Link do Cardápio (opcional)</Label>
                          <Input
                            value={estab.cardapioUrl || ''}
                            onChange={(e) => atualizarEstabelecimento(estab.id, 'cardapioUrl', e.target.value)}
                            placeholder="https://..."
                            type="url"
                          />
                        </div>

                        {idx > 0 && estabelecimentosBares.length > 1 && estabelecimentosBares[0].cardapioUrl && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copiarCardapio(estab.id, estabelecimentosBares[0].id)}
                            >
                              📋 Copiar cardápio do {estabelecimentosBares[0].nome}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <div className="space-y-2 mt-4">
                    <Label>Mapa do Local</Label>
                    <Input
                      value={mapaLocal}
                      onChange={(e) => setMapaLocal(e.target.value)}
                      placeholder="https://..."
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Planta baixa mostrando localização dos bares
                    </p>
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
