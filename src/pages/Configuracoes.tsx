import { useState, useEffect } from 'react';
import { Settings, User, Building2, Bell, Shield, Zap, MessageSquare, Mail, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfiguracoes, useConfiguracoesEmpresaQueries, useConfiguracoesEmpresaMutations } from '@/hooks/configuracoes';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { GerenciarCategorias } from '@/components/configuracoes/GerenciarCategorias';
import { NotificationSettings } from '@/components/configuracoes/NotificationSettings';
import { ConfiguracaoFechamento } from '@/components/configuracoes/ConfiguracaoFechamento';
import { supabase } from '@/integrations/supabase/client';

export default function Configuracoes() {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { configuracoes, atualizarConfiguracoes, testarWhatsApp, testarEmail } = useConfiguracoes();
  const { configuracoes: configuracoesEmpresa } = useConfiguracoesEmpresaQueries();
  const { atualizarConfiguracoesEmpresa } = useConfiguracoesEmpresaMutations();
  
  const podeEditarEmpresa = hasPermission('admin.full_access');
  const [whatsappConfig, setWhatsappConfig] = useState(configuracoes?.notificacoes?.whatsapp || {
    enabled: false,
    apiKey: '',
    phoneNumber: '',
    mensagens: {
      envio_mercadoria: '',
      solicitacao_devolucao: '',
      envio_proposta: ''
    }
  });
  const [emailConfig, setEmailConfig] = useState(configuracoes?.notificacoes?.email || {
    enabled: false,
    remetente: '',
    smtp: {
      host: '',
      port: 587,
      user: '',
      password: ''
    },
    templates: {
      envio_mercadoria: '',
      solicitacao_devolucao: '',
      envio_proposta: ''
    }
  });

  const [empresaData, setEmpresaData] = useState<any>({
    nome: '',
    razao_social: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });

  // Atualizar empresaData quando configuracoesEmpresa mudar
  useEffect(() => {
    if (configuracoesEmpresa) {
      const endereco = configuracoesEmpresa.endereco || {};
      setEmpresaData({
        nome: configuracoesEmpresa.nome || '',
        razao_social: configuracoesEmpresa.razao_social || '',
        cnpj: configuracoesEmpresa.cnpj || '',
        email: configuracoesEmpresa.email || '',
        telefone: configuracoesEmpresa.telefone || '',
        endereco: typeof endereco === 'object' ? {
          cep: endereco.cep || '',
          logradouro: endereco.logradouro || '',
          numero: endereco.numero || '',
          complemento: endereco.complemento || '',
          bairro: endereco.bairro || '',
          cidade: endereco.cidade || '',
          estado: endereco.estado || ''
        } : {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: ''
        }
      });
    }
  }, [configuracoesEmpresa]);

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      if (numeros.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        return numeros
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        // Celular: (XX) XXXXX-XXXX
        return numeros
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');
      }
    }
    return valor;
  };

  const handleTelefoneChange = (valor: string) => {
    const telefoneFormatado = formatarTelefone(valor);
    setEmpresaData({ ...empresaData, telefone: telefoneFormatado });
  };

  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 14) {
      return numeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return valor;
  };

  const validarCNPJ = (cnpj: string) => {
    const numeros = cnpj.replace(/\D/g, '');
    
    if (numeros.length !== 14) return false;
    if (/^(\d)\1+$/.test(numeros)) return false;

    let tamanho = numeros.length - 2;
    let numeros_validacao = numeros.substring(0, tamanho);
    const digitos = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros_validacao = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_validacao.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  const handleCNPJChange = (valor: string) => {
    const cnpjFormatado = formatarCNPJ(valor);
    setEmpresaData({ ...empresaData, cnpj: cnpjFormatado });
  };

  const formatarCEP = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 8) {
      return numeros.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return valor;
  };

  const handleCepChange = async (cep: string) => {
    const cepFormatado = formatarCEP(cep);
    const cepLimpo = cepFormatado.replace(/\D/g, '');
    const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
    setEmpresaData({ 
      ...empresaData, 
      endereco: { ...enderecoAtual, cep: cepFormatado }
    });

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEmpresaData({
            ...empresaData,
            endereco: {
              ...enderecoAtual,
              cep: cepFormatado,
              logradouro: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || ''
            }
          });
          toast({
            title: 'CEP encontrado!',
            description: 'Endereço preenchido automaticamente.',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSalvarEmpresa = async () => {
    if (!podeEditarEmpresa) {
      toast({
        title: 'Sem permissão',
        description: 'Apenas administradores podem editar dados da empresa.',
        variant: 'destructive',
      });
      return;
    }

    if (!empresaData.nome || !empresaData.cnpj || !empresaData.telefone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, CNPJ e telefone.',
        variant: 'destructive',
      });
      return;
    }

    if (!validarCNPJ(empresaData.cnpj)) {
      toast({
        title: 'CNPJ inválido',
        description: 'Por favor, verifique o CNPJ informado.',
        variant: 'destructive',
      });
      return;
    }

    const endereco = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
    if (!endereco.cep || !endereco.logradouro || 
        !endereco.numero || !endereco.bairro || 
        !endereco.cidade || !endereco.estado) {
      toast({
        title: 'Endereço incompleto',
        description: 'Preencha todos os campos obrigatórios do endereço.',
        variant: 'destructive',
      });
      return;
    }

    await atualizarConfiguracoesEmpresa.mutateAsync(empresaData);
  };

  const handleSalvarWhatsApp = async () => {
    await atualizarConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        whatsapp: whatsappConfig,
      },
    });
  };

  const handleSalvarEmail = async () => {
    await atualizarConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        email: emailConfig,
      },
    });
  };

  const handleTestarWhatsApp = async () => {
    if (!whatsappConfig.phoneNumber) {
      toast({
        title: 'Número necessário',
        description: 'Configure um número de WhatsApp antes de testar.',
        variant: 'destructive',
      });
      return;
    }
    await testarWhatsApp(whatsappConfig.phoneNumber, 'Mensagem de teste da plataforma');
  };

  const handleTestarEmail = async () => {
    if (!emailConfig.remetente) {
      toast({
        title: 'Remetente necessário',
        description: 'Configure um e-mail remetente antes de testar.',
        variant: 'destructive',
      });
      return;
    }
    await testarEmail(emailConfig.remetente, 'Teste de Configuração', 'Este é um e-mail de teste da plataforma.');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="fechamento">Fechamento</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Informações Pessoais</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" defaultValue="Usuário" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="usuario@exemplo.com" />
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresa" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <CardTitle>Dados da Empresa</CardTitle>
                </div>
                <CardDescription>
                  Informações que aparecerão nos relatórios e documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Empresa *</Label>
                    <Input 
                      placeholder="Nome Fantasia"
                      value={empresaData.nome || ''}
                      onChange={(e) => setEmpresaData({ ...empresaData, nome: e.target.value })}
                      disabled={!podeEditarEmpresa}
                    />
                  </div>
                  <div>
                    <Label>Razão Social</Label>
                    <Input 
                      placeholder="Razão Social Ltda"
                      value={empresaData.razao_social || ''}
                      onChange={(e) => setEmpresaData({ ...empresaData, razao_social: e.target.value })}
                      disabled={!podeEditarEmpresa}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>CNPJ *</Label>
                    <Input 
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      value={empresaData.cnpj || ''}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      disabled={!podeEditarEmpresa}
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input 
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      value={empresaData.telefone || ''}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      disabled={!podeEditarEmpresa}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="contato@empresa.com"
                    value={empresaData.email || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })}
                    disabled={!podeEditarEmpresa}
                  />
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>CEP *</Label>
                      <Input 
                        placeholder="00000-000"
                        maxLength={9}
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.cep || '' : ''}
                        onChange={(e) => handleCepChange(e.target.value)}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Logradouro *</Label>
                      <Input 
                        placeholder="Avenida, Rua, etc."
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.logradouro || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, logradouro: e.target.value }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Número *</Label>
                      <Input 
                        placeholder="123"
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.numero || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, numero: e.target.value }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Complemento</Label>
                      <Input 
                        placeholder="Sala, Andar, etc."
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.complemento || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, complemento: e.target.value }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Bairro *</Label>
                      <Input 
                        placeholder="Centro"
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.bairro || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, bairro: e.target.value }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                    <div>
                      <Label>Cidade *</Label>
                      <Input 
                        placeholder="São Paulo"
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.cidade || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, cidade: e.target.value }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                    <div>
                      <Label>Estado *</Label>
                      <Input 
                        placeholder="SP"
                        maxLength={2}
                        value={typeof empresaData.endereco === 'object' ? empresaData.endereco?.estado || '' : ''}
                        onChange={(e) => {
                          const enderecoAtual = typeof empresaData.endereco === 'object' ? empresaData.endereco : {};
                          setEmpresaData({ 
                            ...empresaData, 
                            endereco: { ...enderecoAtual, estado: e.target.value.toUpperCase() }
                          });
                        }}
                        disabled={!podeEditarEmpresa}
                      />
                    </div>
                  </div>
                </div>

                {podeEditarEmpresa && (
                  <Button onClick={handleSalvarEmpresa} className="w-full md:w-auto">
                    Salvar Dados da Empresa
                  </Button>
                )}
                
                {!podeEditarEmpresa && (
                  <p className="text-sm text-muted-foreground">
                    Apenas administradores podem editar dados da empresa
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6">
            <div>
              <h2 className="text-2xl font-display mb-2">Gerenciar Categorias</h2>
              <p className="text-muted-foreground">
                Configure as categorias personalizadas para demandas, estoque, despesas e funções de equipe
              </p>
            </div>

            <div className="grid gap-6">
              <GerenciarCategorias
                tipo="demandas"
                titulo="Categorias de Demandas"
                descricao="Personalize as categorias disponíveis para demandas"
              />

              <GerenciarCategorias
                tipo="estoque"
                titulo="Categorias de Estoque"
                descricao="Personalize as categorias de materiais do estoque"
              />

              <GerenciarCategorias
                tipo="despesas"
                titulo="Categorias de Despesas"
                descricao="Personalize as categorias de despesas de eventos"
              />

              <GerenciarCategorias
                tipo="funcoes_equipe"
                titulo="Funções de Equipe"
                descricao="Personalize as funções disponíveis para membros da equipe"
              />
            </div>
          </TabsContent>

          <TabsContent value="fechamento" className="space-y-4">
            <ConfiguracaoFechamento />
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-4">
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>WhatsApp Business API</CardTitle>
                </div>
                <CardDescription>
                  Configure a API do WhatsApp para envio automático de notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar WhatsApp</Label>
                  <Switch
                    checked={whatsappConfig?.enabled || false}
                    onCheckedChange={(checked) =>
                      setWhatsappConfig({ ...whatsappConfig, enabled: checked })
                    }
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="Sua chave da API WhatsApp"
                    value={whatsappConfig.apiKey || ''}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, apiKey: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Número da Empresa (com DDI)</Label>
                  <Input
                    placeholder="+5511999999999"
                    value={whatsappConfig.phoneNumber || ''}
                    onChange={(e) =>
                      setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })
                    }
                  />
                </div>

                <Separator className="my-4" />
                <h4 className="font-semibold">Templates de Mensagens</h4>

                <div>
                  <Label>Envio de Mercadoria</Label>
                  <Textarea
                    placeholder="Olá {{produtor}}, os materiais do evento {{evento}} foram enviados via {{transportadora}}. Rastreamento: {{rastreamento}}"
                    rows={3}
                    value={whatsappConfig?.mensagens?.envio_mercadoria || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        mensagens: { ...whatsappConfig?.mensagens, envio_mercadoria: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Solicitação de Devolução</Label>
                  <Textarea
                    placeholder="Olá {{produtor}}, por favor devolver os materiais do evento {{evento}} até {{data_limite}}."
                    rows={3}
                    value={whatsappConfig?.mensagens?.solicitacao_devolucao || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        mensagens: { ...whatsappConfig?.mensagens, solicitacao_devolucao: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Envio de Proposta</Label>
                  <Textarea
                    placeholder="Olá {{cliente}}, segue proposta comercial para {{evento}}. Link: {{link_proposta}}"
                    rows={3}
                    value={whatsappConfig?.mensagens?.envio_proposta || ''}
                    onChange={(e) =>
                      setWhatsappConfig({
                        ...whatsappConfig,
                        mensagens: { ...whatsappConfig?.mensagens, envio_proposta: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestarWhatsApp} variant="outline">
                    Testar Envio
                  </Button>
                  <Button onClick={handleSalvarWhatsApp}>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Configurações de E-mail</CardTitle>
                </div>
                <CardDescription>Configure o SMTP para envio de e-mails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar E-mail</Label>
                  <Switch
                    checked={emailConfig?.enabled || false}
                    onCheckedChange={(checked) =>
                      setEmailConfig({ ...emailConfig, enabled: checked })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Servidor SMTP</Label>
                    <Input
                      placeholder="smtp.gmail.com"
                      value={emailConfig?.smtp?.host || ''}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          smtp: { 
                            host: e.target.value,
                            port: emailConfig?.smtp?.port || 587,
                            user: emailConfig?.smtp?.user || '',
                            password: emailConfig?.smtp?.password || ''
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Porta</Label>
                    <Input
                      type="number"
                      placeholder="587"
                      value={emailConfig?.smtp?.port || ''}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          smtp: { 
                            host: emailConfig?.smtp?.host || '',
                            port: Number(e.target.value),
                            user: emailConfig?.smtp?.user || '',
                            password: emailConfig?.smtp?.password || ''
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>E-mail Remetente</Label>
                  <Input
                    type="email"
                    placeholder="notificacoes@empresa.com"
                    value={emailConfig.remetente || ''}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, remetente: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Usuário SMTP</Label>
                  <Input
                    placeholder="usuario@smtp.com"
                    value={emailConfig?.smtp?.user || ''}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        smtp: { 
                          host: emailConfig?.smtp?.host || '',
                          port: emailConfig?.smtp?.port || 587,
                          user: e.target.value,
                          password: emailConfig?.smtp?.password || ''
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={emailConfig?.smtp?.password || ''}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        smtp: { 
                          host: emailConfig?.smtp?.host || '',
                          port: emailConfig?.smtp?.port || 587,
                          user: emailConfig?.smtp?.user || '',
                          password: e.target.value
                        },
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestarEmail} variant="outline">
                    Testar Envio
                  </Button>
                  <Button onClick={handleSalvarEmail}>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-4">
            <NotificationSettings />
            
            {/* Card de Teste de Notificações */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Testar Notificações Push</CardTitle>
                </div>
                <CardDescription>
                  Envie uma notificação de teste para verificar se está tudo funcionando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke('send-push', {
                        body: {
                          userId: (await supabase.auth.getUser()).data.user?.id,
                          title: '🎉 Notificação de Teste',
                          body: 'Se você está vendo isso, as notificações estão funcionando perfeitamente!',
                          url: '/configuracoes'
                        }
                      });

                      if (error) throw error;

                      toast({
                        title: 'Teste enviado!',
                        description: 'Verifique se recebeu a notificação.',
                      });
                    } catch (error) {
                      console.error('Erro ao testar notificação:', error);
                      toast({
                        title: 'Erro ao testar',
                        description: 'Verifique se as notificações estão ativadas.',
                        variant: 'destructive'
                      });
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enviar Notificação de Teste
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Preferências de Notificações</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos eventos</p>
                    <p className="text-sm text-muted-foreground">Receber notificações de novos eventos</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Demandas</p>
                    <p className="text-sm text-muted-foreground">Notificações de demandas atribuídas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Segurança</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Senha Atual</Label>
                  <Input type="password" />
                </div>
                <div>
                  <Label>Nova Senha</Label>
                  <Input type="password" />
                </div>
                <Button>Alterar Senha</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
