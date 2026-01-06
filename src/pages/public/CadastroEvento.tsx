import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Beer, Zap, Info, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Loader2, Plus, Trash2, Upload, Image, Landmark, QrCode, Building } from 'lucide-react';
import { CadastroEventoLayout, ImageUploadField } from '@/components/cadastro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MaskedInput, formatarTelefoneProgressivo, formatarCEPProgressivo, formatarCPFProgressivo, formatarCNPJProgressivo } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCadastros } from '@/hooks/cadastros';
import { TipoEvento, SetorEvento, PontoVenda, EstabelecimentoBar, TipoIngresso, SetorCampo, TipoIngressoCampo, LoteCampo, PDVCampo, PDVEnderecoCampo, EstabelecimentoCampo, TipoPagamento, TipoChavePix, TipoConta, DadosBancarios } from '@/types/eventos';
import { estados, validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { BANCOS_BRASILEIROS, TIPOS_CHAVE_PIX, TIPOS_CONTA } from '@/lib/constants/bancos';

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
  
  // Estado para busca de cliente por documento
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [documentoInvalido, setDocumentoInvalido] = useState(false);
  const [erroRede, setErroRede] = useState(false);

  // Função para verificar se documento é obviamente inválido (todos dígitos iguais)
  const documentoObviamenteInvalido = (doc: string): boolean => {
    const limpo = doc.replace(/\D/g, '');
    if (limpo.length === 0) return false;
    return /^(\d)\1+$/.test(limpo);
  };

  // Honeypot anti-bot (campo oculto que humanos não preenchem)
  const [honeypot, setHoneypot] = useState('');
  
  // Observações
  const [observacoes, setObservacoes] = useState('');
  
  // Dados Bancários para Pagamento
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>('pix');
  const [chavePix, setChavePix] = useState('');
  const [tipoChavePix, setTipoChavePix] = useState<TipoChavePix>('cpf');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [tipoConta, setTipoConta] = useState<TipoConta>('corrente');
  const [cpfCnpjTitular, setCpfCnpjTitular] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  
  // Pontos de Venda (Ingresso)
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [pdvCepBusca, setPdvCepBusca] = useState<Record<string, boolean>>({});
  
  // ID temporário para uploads (gerado uma vez)
  const tempUploadId = useMemo(() => `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`, []);
  
  // Banners e Imagens (Ingresso/Híbrido)
  const [bannerSite, setBannerSite] = useState<string | undefined>();
  const [miniaturaSite, setMiniaturaSite] = useState<string | undefined>();
  const [mapaSite, setMapaSite] = useState<string | undefined>();
  const [ingressoPOS, setIngressoPOS] = useState<string | undefined>();
  
  // Estabelecimentos de Bar
  const [estabelecimentosBares, setEstabelecimentosBares] = useState<EstabelecimentoBar[]>([
    { id: '1', nome: 'Bar Principal', quantidadeMaquinas: 1 }
  ]);
  const [mapaLocal, setMapaLocal] = useState('');
  const [mapaLocalArquivo, setMapaLocalArquivo] = useState<string | undefined>();
  const [logoEvento, setLogoEvento] = useState<string | undefined>();
  
  // Busca automática de cliente por documento (CPF/CNPJ)
  useEffect(() => {
    const documentoLimpo = produtorDocumento.replace(/\D/g, '');
    const tamanhoEsperado = produtorTipo === 'CPF' ? 11 : 14;
    
    // Só buscar se documento estiver completo
    if (documentoLimpo.length !== tamanhoEsperado) {
      setClienteEncontrado(false);
      setDocumentoInvalido(false);
      setErroRede(false);
      return;
    }

    // Validação prévia: documentos obviamente inválidos (todos dígitos iguais)
    if (documentoObviamenteInvalido(documentoLimpo)) {
      setDocumentoInvalido(true);
      setClienteEncontrado(false);
      setErroRede(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setBuscandoCliente(true);
      setErroRede(false);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/buscar-cliente-por-documento`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: documentoLimpo, tipo: produtorTipo }),
          }
        );
        
        const data = await response.json();
        
        if (data.documentoInvalido) {
          setDocumentoInvalido(true);
          setClienteEncontrado(false);
        } else if (data.encontrado && data.cliente) {
          // Preencher campos automaticamente
          setProdutorNome(data.cliente.nome || '');
          setProdutorEmail(data.cliente.email || '');
          setProdutorTelefone(formatarTelefoneProgressivo(data.cliente.telefone || ''));
          setProdutorWhatsapp(formatarTelefoneProgressivo(data.cliente.whatsapp || ''));
          
          // Endereço
          if (data.cliente.endereco) {
            setProdutorCep(formatarCEPProgressivo(data.cliente.endereco.cep || ''));
            setProdutorLogradouro(data.cliente.endereco.logradouro || '');
            setProdutorNumero(data.cliente.endereco.numero || '');
            setProdutorComplemento(data.cliente.endereco.complemento || '');
            setProdutorBairro(data.cliente.endereco.bairro || '');
            setProdutorCidade(data.cliente.endereco.cidade || '');
            setProdutorEstado(data.cliente.endereco.estado || '');
          }
          
          // Responsável legal (CNPJ)
          if (data.cliente.responsavelLegal && produtorTipo === 'CNPJ') {
            setResponsavelNome(data.cliente.responsavelLegal.nome || '');
            setResponsavelCpf(formatarCPFProgressivo(data.cliente.responsavelLegal.cpf || ''));
            setResponsavelDataNascimento(data.cliente.responsavelLegal.data_nascimento || data.cliente.responsavelLegal.dataNascimento || '');
          }
          
          setClienteEncontrado(true);
          setDocumentoInvalido(false);
          toast({
            title: 'Cliente encontrado!',
            description: 'Dados preenchidos automaticamente. Você pode editar se necessário.',
          });
        } else {
          setClienteEncontrado(false);
          setDocumentoInvalido(false);
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        setClienteEncontrado(false);
        setDocumentoInvalido(false);
        setErroRede(true);
      } finally {
        setBuscandoCliente(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [produtorDocumento, produtorTipo]);

  // Limpar campos ao mudar tipo de pessoa
  const handleTipoProdutorChange = (novoTipo: 'CPF' | 'CNPJ') => {
    setProdutorTipo(novoTipo);
    setProdutorDocumento('');
    setProdutorNome('');
    setProdutorEmail('');
    setProdutorTelefone('');
    setProdutorWhatsapp('');
    setProdutorCep('');
    setProdutorLogradouro('');
    setProdutorNumero('');
    setProdutorComplemento('');
    setProdutorBairro('');
    setProdutorCidade('');
    setProdutorEstado('');
    setResponsavelNome('');
    setResponsavelCpf('');
    setResponsavelDataNascimento('');
    setClienteEncontrado(false);
    setDocumentoInvalido(false);
    setErroRede(false);
  };
  
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

      // Montar configuração de ingresso - filtrar dados vazios
      const setoresFiltrados = setores
        .filter(s => s.nome && s.nome.trim() !== '')
        .map(setor => ({
          ...setor,
          tiposIngresso: setor.tiposIngresso
            .filter(tipo => tipo.nome && tipo.nome.trim() !== '')
            .map(tipo => ({
              ...tipo,
              lotes: tipo.lotes.filter(lote => 
                lote.quantidade > 0 || lote.preco > 0
              )
            }))
        }));

      const configuracaoIngresso = (tipoEvento === 'ingresso' || tipoEvento === 'hibrido') ? {
        setores: setoresFiltrados,
        pontosVenda: pontosVenda.filter(p => p.nome && p.nome.trim() !== ''),
        mapaEvento: mapaSite || undefined,
        banners: {
          bannerSite: bannerSite || undefined,
          miniaturaSite: miniaturaSite || undefined,
          mapaSite: mapaSite || undefined,
          ingressoPOS: ingressoPOS || undefined,
        },
      } : undefined;

      // Montar configuração de bar - filtrar estabelecimentos vazios
      const estabelecimentosFiltrados = estabelecimentosBares
        .filter(e => e.nome && e.nome.trim() !== '');

      const configuracaoBar = (tipoEvento === 'bar' || tipoEvento === 'hibrido') ? {
        estabelecimentos: estabelecimentosFiltrados,
        mapaLocal: mapaLocal || mapaLocalArquivo || undefined,
        mapaLocalArquivo: mapaLocalArquivo || undefined,
        logoEvento: logoEvento || undefined,
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
          dadosBancarios: {
            tipoPagamento,
            ...(tipoPagamento === 'pix' ? {
              chavePix,
              tipoChavePix,
            } : {
              banco,
              agencia,
              conta,
              tipoConta,
            }),
            cpfCnpjTitular: cpfCnpjTitular.replace(/\D/g, ''),
            nomeTitular,
          },
        },
        configuracaoIngresso,
        configuracaoBar,
      });

      navigate(`/cadastro-evento/${protocolo}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente mais tarde.';
      toast({
        title: 'Erro ao cadastrar evento',
        description: errorMessage,
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

  const atualizarSetor = (setorId: string, campo: SetorCampo, valor: string | number) => {
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

  const atualizarTipoIngresso = (setorId: string, tipoId: string, campo: TipoIngressoCampo, valor: string) => {
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
    campo: LoteCampo, 
    valor: string | number
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
                const valorConvertido = (campo === 'quantidade' || campo === 'preco') 
                  ? Number(valor) 
                  : String(valor);
                novosLotes[loteExistente] = {
                  ...novosLotes[loteExistente],
                  [campo]: valorConvertido,
                };
                return { ...t, lotes: novosLotes as typeof t.lotes };
              } else {
                return {
                  ...t,
                  lotes: [
                    ...t.lotes,
                    {
                      numero: numeroLote as 1 | 2 | 3 | 4,
                      quantidade: campo === 'quantidade' ? Number(valor) : 0,
                      preco: campo === 'preco' ? Number(valor) : 0,
                      dataAberturaOnline: campo === 'dataAberturaOnline' ? String(valor) : '',
                      dataAberturaPDV: campo === 'dataAberturaPDV' ? String(valor) : '',
                      dataFechamentoOnline: campo === 'dataFechamentoOnline' ? String(valor) : '',
                      dataFechamentoPDV: campo === 'dataFechamentoPDV' ? String(valor) : '',
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

  const atualizarPDV = (pdvId: string, campo: PDVCampo | PDVEnderecoCampo, valor: string) => {
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

  const atualizarEstabelecimento = (estabId: string, campo: EstabelecimentoCampo, valor: string | number) => {
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
      <CadastroEventoLayout currentStep={1} subtitle="Qual tipo de evento você quer criar?">
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Selecione o tipo de evento</CardTitle>
            <CardDescription>Escolha a opção que melhor se aplica ao seu evento</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-44 flex flex-col gap-4 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
              onClick={() => { setTipoEvento('ingresso'); setStep(2); }}
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Ticket className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold block">Ingresso</span>
                <span className="text-xs text-muted-foreground">Venda de ingressos</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-44 flex flex-col gap-4 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
              onClick={() => { setTipoEvento('bar'); setStep(2); }}
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Beer className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold block">Bar</span>
                <span className="text-xs text-muted-foreground">Consumação no local</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-44 flex flex-col gap-4 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
              onClick={() => { setTipoEvento('hibrido'); setStep(2); }}
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold block">Híbrido</span>
                <span className="text-xs text-muted-foreground">Ingresso + Bar</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </CadastroEventoLayout>
    );
  }

  // Passo 2: Dados básicos do evento
  if (step === 2) {
    return (
      <CadastroEventoLayout currentStep={2} subtitle="Informações básicas do evento">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle>Dados do Evento</CardTitle>
              <CardDescription>Preencha as informações básicas</CardDescription>
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
                    <MaskedInput
                      mask="cep"
                      value={cep}
                      onChange={setCep}
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
      </CadastroEventoLayout>
    );
  }

  // Passo 3: Dados do produtor
  if (step === 3) {
    return (
      <CadastroEventoLayout currentStep={3} subtitle="Informações do produtor/organizador">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle>Dados do Produtor</CardTitle>
              <CardDescription>Preencha os dados do responsável pelo evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Pessoa *</Label>
                <Select value={produtorTipo} onValueChange={handleTipoProdutorChange}>
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
                <Label>{produtorTipo === 'CNPJ' ? 'CNPJ *' : 'CPF *'}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Digite seu {produtorTipo} para verificar se já possui cadastro
                </p>
                <div className="relative">
                  <MaskedInput
                    mask="documento"
                    documentType={produtorTipo}
                    value={produtorDocumento}
                    onChange={setProdutorDocumento}
                    disabled={buscandoCliente}
                  />
                  {buscandoCliente && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                {/* Feedback: Documento inválido */}
                {documentoInvalido && !buscandoCliente && (
                  <Alert className="mt-2 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {produtorTipo} inválido. Verifique o número informado.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Feedback: Cliente encontrado */}
                {clienteEncontrado && !buscandoCliente && !documentoInvalido && (
                  <Alert className="mt-2 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Cliente encontrado! Dados preenchidos automaticamente. Você pode editar se necessário.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Feedback: Novo cadastro */}
                {!clienteEncontrado && 
                 !buscandoCliente && 
                 !documentoInvalido &&
                 !erroRede &&
                 produtorDocumento.replace(/\D/g, '').length === (produtorTipo === 'CPF' ? 11 : 14) && (
                  <Alert className="mt-2 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Novo cadastro. Preencha os dados abaixo.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Feedback: Erro de rede */}
                {erroRede && !buscandoCliente && (
                  <Alert className="mt-2 bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      Não foi possível verificar o cadastro. Preencha os dados manualmente.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label>{produtorTipo === 'CNPJ' ? 'Razão Social *' : 'Nome Completo *'}</Label>
                <Input value={produtorNome} onChange={(e) => setProdutorNome(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone *</Label>
                  <MaskedInput
                    mask="telefone"
                    value={produtorTelefone}
                    onChange={setProdutorTelefone}
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <MaskedInput
                    mask="telefone"
                    value={produtorWhatsapp}
                    onChange={setProdutorWhatsapp}
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
                      <MaskedInput
                        mask="cep"
                        value={produtorCep}
                        onChange={setProdutorCep}
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
                        <MaskedInput
                          mask="cpf"
                          value={responsavelCpf}
                          onChange={setResponsavelCpf}
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
      </CadastroEventoLayout>
    );
  }

  // Passo 4: Configurações específicas (Ingresso ou Bar)
  if (step === 4) {
    return (
      <CadastroEventoLayout currentStep={4} subtitle="Configurações específicas do evento">
        <div className="space-y-6">
          {/* Imagens do Evento (Ingresso/Híbrido) */}
          {(tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && (
            <Card className="border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imagens do Evento
                </CardTitle>
                <CardDescription>
                  Envie as imagens para divulgação do seu evento (todas opcionais)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <ImageUploadField
                  label="Banner Site"
                  dimensions="1170x400px"
                  description="Banner principal para o site do evento"
                  value={bannerSite}
                  onChange={setBannerSite}
                  tempId={tempUploadId}
                />
                <ImageUploadField
                  label="Miniatura Site"
                  dimensions="500x500px"
                  description="Thumbnail/card do evento nas listagens"
                  value={miniaturaSite}
                  onChange={setMiniaturaSite}
                  tempId={tempUploadId}
                />
                <ImageUploadField
                  label="Mapa Site"
                  dimensions="1000x1000px"
                  description="Mapa de assentos ou setores do evento"
                  value={mapaSite}
                  onChange={setMapaSite}
                  tempId={tempUploadId}
                />
                <ImageUploadField
                  label="Ingresso POS"
                  dimensions="300x200px"
                  description="Imagem impressa no ingresso físico"
                  value={ingressoPOS}
                  onChange={setIngressoPOS}
                  tempId={tempUploadId}
                />
              </CardContent>
            </Card>
          )}

          {/* Setores e Ingressos */}
          {(tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && (
            <Card className="border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle>Setores e Ingressos</CardTitle>
                <CardDescription>Configure setores e tipos de ingresso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          <Label>Nome do Setor *</Label>
                          <Input
                            value={setor.nome}
                            onChange={(e) => setSetores(setores.map(s => 
                              s.id === setor.id ? { ...s, nome: e.target.value } : s
                            ))}
                            placeholder="Ex: Pista, Camarote"
                            className={!setor.nome.trim() ? 'border-orange-400 focus-visible:ring-orange-400' : ''}
                          />
                          {!setor.nome.trim() && (
                            <span className="text-xs text-orange-500">Nome obrigatório</span>
                          )}
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

                      {/* Tipos de Ingresso do Setor */}
                      {setor.tiposIngresso.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <Label className="font-semibold">Tipos de Ingresso</Label>
                          {setor.tiposIngresso.map((tipo, tipoIdx) => (
                            <Card key={tipo.id} className="bg-muted/50">
                              <CardContent className="pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <Label className="font-medium">Tipo {tipoIdx + 1}</Label>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removerTipoIngresso(setor.id, tipo.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Nome *</Label>
                                  <Input
                                    value={tipo.nome}
                                    onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)}
                                    placeholder="Ex: Meia-entrada, Inteira, VIP"
                                    className={!tipo.nome.trim() ? 'border-orange-400 focus-visible:ring-orange-400' : ''}
                                  />
                                  {!tipo.nome.trim() && (
                                    <span className="text-xs text-orange-500">Nome obrigatório</span>
                                  )}
                                </div>
                                
                                {/* Lotes do Tipo de Ingresso */}
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium">Lotes</Label>
                                  {(() => {
                                    // Calcular quais lotes exibir dinamicamente
                                    const lotesComDados = tipo.lotes.filter(l => 
                                      (l.quantidade && l.quantidade > 0) || (l.preco && l.preco > 0)
                                    );
                                    const ultimoLoteComDados = Math.max(...lotesComDados.map(l => l.numero), 0);
                                    const proximoLote = Math.min(ultimoLoteComDados + 1, 4);
                                    
                                    const lotesVisiveis = [1, 2, 3, 4].filter(n => {
                                      if (n === 1) return true; // Lote 1 sempre visível
                                      const temDados = tipo.lotes.some(l => 
                                        l.numero === n && ((l.quantidade && l.quantidade > 0) || (l.preco && l.preco > 0))
                                      );
                                      if (temDados) return true;
                                      return n === proximoLote; // Próximo lote disponível
                                    });
                                    
                                    return (
                                      <>
                                        {lotesVisiveis.map((numeroLote) => {
                                          const lote = tipo.lotes.find(l => l.numero === numeroLote);
                                          return (
                                            <div key={numeroLote} className="p-3 border rounded-lg bg-background space-y-2">
                                              <Label className="text-xs font-semibold text-muted-foreground">Lote {numeroLote}</Label>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <div>
                                                  <Label className="text-xs">Quantidade</Label>
                                                  <Input
                                                    type="number"
                                                    placeholder="Qtd"
                                                    value={lote?.quantidade || ''}
                                                    onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote as 1|2|3|4, 'quantidade', e.target.value)}
                                                  />
                                                </div>
                                                <div>
                                                  <Label className="text-xs">Preço (R$)</Label>
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0,00"
                                                    value={lote?.preco || ''}
                                                    onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote as 1|2|3|4, 'preco', e.target.value)}
                                                  />
                                                </div>
                                                <div>
                                                  <Label className="text-xs">Abertura Online</Label>
                                                  <Input
                                                    type="date"
                                                    value={lote?.dataAberturaOnline || ''}
                                                    onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote as 1|2|3|4, 'dataAberturaOnline', e.target.value)}
                                                  />
                                                </div>
                                                <div>
                                                  <Label className="text-xs">Fechamento Online</Label>
                                                  <Input
                                                    type="date"
                                                    value={lote?.dataFechamentoOnline || ''}
                                                    onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote as 1|2|3|4, 'dataFechamentoOnline', e.target.value)}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {lotesVisiveis.length < 4 && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            type="button"
                                            onClick={() => {
                                              const proximoNumero = Math.max(...lotesVisiveis) + 1;
                                              if (proximoNumero <= 4) {
                                                atualizarLote(setor.id, tipo.id, proximoNumero as 1|2|3|4, 'quantidade', '0');
                                              }
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Adicionar Lote {Math.max(...lotesVisiveis) + 1}
                                          </Button>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarTipoIngresso(setor.id)}
                        className="mt-4"
                      >
                        + Adicionar Tipo de Ingresso
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Logo do Evento (Bar/Híbrido) */}
          {(tipoEvento === 'bar' || tipoEvento === 'hibrido') && (
            <Card className="border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo do Evento
                </CardTitle>
                <CardDescription>
                  Envie a logo do evento para identificação (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadField
                  label="Logo do Evento"
                  dimensions="500x500px"
                  description="Logotipo ou identidade visual do evento"
                  value={logoEvento}
                  onChange={setLogoEvento}
                  tempId={tempUploadId}
                />
              </CardContent>
            </Card>
          )}

          {/* Configuração de Bar */}
          {(tipoEvento === 'bar' || tipoEvento === 'hibrido') && (
            <Card className="border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle>Configuração do Bar</CardTitle>
                <CardDescription>Defina os estabelecimentos e configurações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Card key={estab.id} className="border-amber-500/30">
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

                      <div className="space-y-3">
                        <Label>Cardápio</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              value={estab.cardapioUrl || ''}
                              onChange={(e) => atualizarEstabelecimento(estab.id, 'cardapioUrl', e.target.value)}
                              placeholder="https://link-do-cardapio.com"
                              type="url"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Link externo (opcional)</p>
                          </div>
                          <ImageUploadField
                            label="Ou envie o arquivo"
                            description="PDF ou imagem do cardápio"
                            value={estab.cardapioArquivo}
                            onChange={(url) => {
                              setEstabelecimentosBares(estabelecimentosBares.map(e =>
                                e.id === estab.id ? { ...e, cardapioArquivo: url } : e
                              ));
                            }}
                            accept={['application/pdf', 'image/jpeg', 'image/png', 'image/webp']}
                            tempId={`${tempUploadId}-bar-${estab.id}`}
                          />
                        </div>
                      </div>

                      {idx > 0 && estabelecimentosBares.length > 1 && (estabelecimentosBares[0].cardapioUrl || estabelecimentosBares[0].cardapioArquivo) && (
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

                <div className="space-y-4 mt-4 pt-4 border-t">
                  <h4 className="font-medium">Mapa do Local</h4>
                  <p className="text-sm text-muted-foreground">
                    Planta baixa mostrando localização dos bares (link ou upload)
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Link do Mapa</Label>
                      <Input
                        value={mapaLocal}
                        onChange={(e) => setMapaLocal(e.target.value)}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                    <ImageUploadField
                      label="Ou envie a imagem"
                      description="Imagem do mapa/planta baixa"
                      value={mapaLocalArquivo}
                      onChange={setMapaLocalArquivo}
                      tempId={tempUploadId}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerta de validação para ingressos */}
          {(tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && 
           setores.some(s => !s.nome.trim() || s.tiposIngresso.some(t => !t.nome.trim())) && (
            <Alert className="border-orange-400 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-700 dark:text-orange-400">
                Preencha o nome de todos os setores e tipos de ingresso para continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => setStep(5)}
              disabled={(tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && 
                setores.some(s => !s.nome.trim() || s.tiposIngresso.some(t => !t.nome.trim()))}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CadastroEventoLayout>
    );
  }

  // Passo 5: Dados bancários e observações
  if (step === 5) {
    return (
      <CadastroEventoLayout currentStep={5} subtitle="Dados para recebimento e observações">
        <div className="space-y-6">
          {/* Dados Bancários */}
          <Card className="border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Dados para Pagamento
              </CardTitle>
              <CardDescription>
                Informe os dados bancários para recebimento dos valores (essencial para contratos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Estas informações serão utilizadas para gerar contratos e realizar pagamentos
                </AlertDescription>
              </Alert>

              <div>
                <Label>Forma de Recebimento *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={tipoPagamento === 'pix' ? 'default' : 'outline'}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setTipoPagamento('pix')}
                  >
                    <QrCode className="h-6 w-6" />
                    <span>PIX</span>
                  </Button>
                  <Button
                    type="button"
                    variant={tipoPagamento === 'conta_bancaria' ? 'default' : 'outline'}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setTipoPagamento('conta_bancaria')}
                  >
                    <Building className="h-6 w-6" />
                    <span>Conta Bancária</span>
                  </Button>
                </div>
              </div>

              {/* Campos de PIX */}
              {tipoPagamento === 'pix' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label>Tipo de Chave PIX *</Label>
                    <Select value={tipoChavePix} onValueChange={(v) => setTipoChavePix(v as TipoChavePix)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CHAVE_PIX.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chave PIX *</Label>
                    <Input
                      value={chavePix}
                      onChange={(e) => setChavePix(e.target.value)}
                      placeholder={
                        tipoChavePix === 'cpf' ? '000.000.000-00' :
                        tipoChavePix === 'cnpj' ? '00.000.000/0000-00' :
                        tipoChavePix === 'email' ? 'email@exemplo.com' :
                        tipoChavePix === 'telefone' ? '(00) 00000-0000' :
                        'Chave aleatória'
                      }
                    />
                  </div>
                </div>
              )}

              {/* Campos de Conta Bancária */}
              {tipoPagamento === 'conta_bancaria' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label>Banco *</Label>
                    <Select value={banco} onValueChange={setBanco}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANCOS_BRASILEIROS.map((b) => (
                          <SelectItem key={b.codigo} value={b.codigo}>
                            {b.codigo} - {b.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Agência *</Label>
                      <Input
                        value={agencia}
                        onChange={(e) => setAgencia(e.target.value)}
                        placeholder="0000"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label>Conta *</Label>
                      <Input
                        value={conta}
                        onChange={(e) => setConta(e.target.value)}
                        placeholder="00000-0"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Tipo de Conta *</Label>
                    <Select value={tipoConta} onValueChange={(v) => setTipoConta(v as TipoConta)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CONTA.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Dados do Titular (comum) */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground">Dados do Titular</h4>
                <div>
                  <Label>Nome do Titular *</Label>
                  <Input
                    value={nomeTitular}
                    onChange={(e) => setNomeTitular(e.target.value)}
                    placeholder="Nome completo do titular da conta"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ do Titular *</Label>
                  <MaskedInput
                    mask="documento"
                    documentType={cpfCnpjTitular.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF'}
                    value={cpfCnpjTitular}
                    onChange={setCpfCnpjTitular}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>Observações importantes sobre o evento (opcional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Observações ou informações importantes</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva detalhes importantes sobre o evento..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => setStep(6)}
              disabled={
                !nomeTitular || 
                !cpfCnpjTitular ||
                (tipoPagamento === 'pix' && !chavePix) ||
                (tipoPagamento === 'conta_bancaria' && (!banco || !agencia || !conta))
              }
            >
              Revisar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CadastroEventoLayout>
    );
  }

  // Calcular total de imagens enviadas
  const imagensEnviadas = [
    bannerSite, miniaturaSite, mapaSite, ingressoPOS, logoEvento, mapaLocalArquivo,
    ...estabelecimentosBares.map(e => e.cardapioArquivo).filter(Boolean)
  ].filter(Boolean);

  // Passo 6: Revisão final
  return (
    <CadastroEventoLayout currentStep={6} subtitle="Confira os dados antes de enviar">
      <div className="space-y-6">
        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Revisão Final</CardTitle>
            <CardDescription>Verifique todas as informações antes de enviar</CardDescription>
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

            {/* Imagens Enviadas */}
            {imagensEnviadas.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Imagens Enviadas ({imagensEnviadas.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {bannerSite && (
                    <div className="space-y-1">
                      <img src={bannerSite} alt="Banner" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Banner</p>
                    </div>
                  )}
                  {miniaturaSite && (
                    <div className="space-y-1">
                      <img src={miniaturaSite} alt="Miniatura" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Miniatura</p>
                    </div>
                  )}
                  {mapaSite && (
                    <div className="space-y-1">
                      <img src={mapaSite} alt="Mapa" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Mapa</p>
                    </div>
                  )}
                  {ingressoPOS && (
                    <div className="space-y-1">
                      <img src={ingressoPOS} alt="Ingresso" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Ingresso</p>
                    </div>
                  )}
                  {logoEvento && (
                    <div className="space-y-1">
                      <img src={logoEvento} alt="Logo" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Logo</p>
                    </div>
                  )}
                  {mapaLocalArquivo && (
                    <div className="space-y-1">
                      <img src={mapaLocalArquivo} alt="Mapa Local" className="w-full h-16 object-cover rounded border" />
                      <p className="text-xs text-muted-foreground text-center">Mapa Local</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configurações de Bar */}
            {(tipoEvento === 'bar' || tipoEvento === 'hibrido') && estabelecimentosBares.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Estabelecimentos de Bar ({estabelecimentosBares.length})</h3>
                <ul className="text-sm space-y-1">
                  {estabelecimentosBares.map((estab, idx) => (
                    <li key={estab.id} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      <span className="font-medium">{estab.nome}</span>
                      <span className="text-muted-foreground">({estab.quantidadeMaquinas} máquina{estab.quantidadeMaquinas > 1 ? 's' : ''})</span>
                      {(estab.cardapioUrl || estab.cardapioArquivo) && (
                        <span className="text-green-600 text-xs">✓ cardápio</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
    </CadastroEventoLayout>
  );
}
