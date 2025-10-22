import { useState } from 'react';
import { Settings, User, Building2, Bell, Shield, Zap, MessageSquare, Mail, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfiguracoes } from '@/contexts/ConfiguracoesContext';
import { useToast } from '@/hooks/use-toast';
import { GerenciarCategorias } from '@/components/configuracoes/GerenciarCategorias';
import { GerenciarUsuarios } from '@/components/configuracoes/GerenciarUsuarios';
import { MatrizPermissoes } from '@/components/configuracoes/MatrizPermissoes';

export default function Configuracoes() {
  const { toast } = useToast();
  const { configuracoes, atualizarConfiguracoes, testarWhatsApp, testarEmail } = useConfiguracoes();
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input defaultValue="Minha Empresa" />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input defaultValue="00.000.000/0001-00" />
                </div>
                <Button>Salvar</Button>
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

          <TabsContent value="usuarios" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Para criar novos usuários ou conceder acesso ao sistema, vá em <strong>Equipe</strong> e gerencie a partir de lá. 
                Aqui você gerencia apenas as permissões de usuários existentes.
              </p>
            </div>
            <GerenciarUsuarios />
            <MatrizPermissoes />
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
