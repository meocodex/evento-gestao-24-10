import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { FormSheet } from '@/components/shared/sheets';
import { useSheetState } from '@/components/shared/sheets/useSheetState';
import { PasswordStrengthIndicator } from '@/components/shared/PasswordStrengthIndicator';
import { passwordSchema } from '@/lib/validations/auth';
import { permissionsPresets, PresetType } from '@/lib/permissionsPresets';
import { ZodError } from 'zod';

interface ConcederAcessoSistemaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro: MembroEquipeUnificado | null;
}

export function ConcederAcessoSistemaSheet({ open, onOpenChange, membro }: ConcederAcessoSistemaSheetProps) {
  
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rolesSelecionadas, setRolesSelecionadas] = useState<string[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [concedendo, setConcedendo] = useState(false);

  const { close } = useSheetState({
    onClose: () => {
      setEmail('');
      setSenha('');
      setRolesSelecionadas([]);
      setPermissoesSelecionadas([]);
      onOpenChange(false);
    },
  });

  // Inicializar email com o email do membro
  useEffect(() => {
    if (membro?.email) {
      setEmail(membro.email);
    }
  }, [membro]);

  // Auto-sugerir permissões quando roles mudarem
  useEffect(() => {
    if (rolesSelecionadas.length === 0) return;
    
    // Combinar permissões de todos os presets selecionados
    const permissoesSugeridas = new Set<string>();
    
    rolesSelecionadas.forEach(role => {
      const preset = permissionsPresets[role as PresetType];
      if (preset) {
        preset.permissions.forEach(p => permissoesSugeridas.add(p));
      }
    });
    
    // Se ainda não há permissões selecionadas, auto-preencher com sugestões
    if (permissoesSelecionadas.length === 0 && permissoesSugeridas.size > 0) {
      setPermissoesSelecionadas(Array.from(permissoesSugeridas));
      toast.success('Permissões sugeridas aplicadas', {
        description: `${permissoesSugeridas.size} permissões foram automaticamente selecionadas com base nas funções escolhidas.`,
      });
    }
  }, [rolesSelecionadas]);

  // Função para remover formatação de CPF/Telefone
  const limparFormatacao = (valor: string | undefined): string => {
    if (!valor) return '';
    return valor.replace(/\D/g, ''); // Remove tudo que não é dígito
  };

  const handleSubmit = async () => {
    if (!membro) {
      return;
    }

    if (!email || !senha) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha o email e a senha.',
      });
      return;
    }

    // Validar senha com passwordSchema
    try {
      passwordSchema.parse(senha);
    } catch (error: unknown) {
      const messages = error instanceof ZodError 
        ? error.errors.map(e => e.message).join('\n') 
        : 'Senha inválida';
      toast.error('Senha não atende aos requisitos', {
        description: messages,
      });
      return;
    }

    if (rolesSelecionadas.length === 0) {
      toast.error('Funções obrigatórias', {
        description: 'Selecione pelo menos 1 função para o membro.',
      });
      return;
    }

    if (permissoesSelecionadas.length === 0) {
      toast.error('Permissões obrigatórias', {
        description: 'Você deve selecionar pelo menos 1 permissão. Use o botão "Aplicar Sugestões" ou selecione manualmente na aba Permissões.',
        duration: 6000,
      });
      return;
    }

    try {
      setConcedendo(true);

      const { data, error } = await supabase.functions.invoke('criar-operador', {
        body: {
          nome: membro.nome,
          email: email,
          cpf: limparFormatacao(membro.cpf) || undefined,
          telefone: limparFormatacao(membro.telefone),
          senha: senha,
          roles: rolesSelecionadas,
          permissions: permissoesSelecionadas
        }
      });

      // Verificar erro de rede
      if (error) {
        // Verificar se é erro de usuário já existente (não órfão)
        if (error.message?.includes('email_already_exists')) {
          toast.error('Email já cadastrado', {
            description: `Este email já está cadastrado no sistema. Use "Gerenciar Permissões" para editar as permissões do usuário existente.`,
          });
          close();
          return;
        }
        
        // Verificar se houve erro na limpeza
        if (error.message?.includes('cleanup_failed')) {
          toast.error('Erro ao processar', {
            description: 'Não foi possível processar a solicitação. Contate o suporte técnico.',
          });
          close();
          return;
        }
        
        // Erros genéricos
        throw error;
      }

      // Verificar se há erro no response body (backend retornou erro)
      if (data?.error) {
        if (data.error === 'invalid_permissions') {
          const invalidList = data.invalid ? data.invalid.join(', ') : 'desconhecidas';
          toast.error('Permissões inválidas', {
            description: `As seguintes permissões não existem no sistema: ${invalidList}. Entre em contato com o administrador.`,
          });
          close();
          return;
        }
        
        // Outro erro do backend
        throw new Error(data.message || data.error);
      }

      toast.success('Acesso concedido com sucesso', {
        description: `✅ ${rolesSelecionadas.length} função(ões) atribuída(s) • ✅ ${permissoesSelecionadas.length} permissão(ões) aplicada(s). O usuário deve fazer logout e login novamente.`,
        duration: 8000,
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
      queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });

      close();
    } catch (error: unknown) {
      console.error('Erro ao conceder acesso:', error);
      
      let errorMessage = 'Erro ao conceder acesso. Tente novamente.';
      
      // Parse de erros de validação da edge function
      const err = error as { message?: string; context?: { details?: Record<string, string[]> } };
      if (err.message?.includes('Dados inválidos') || err.context) {
        const details = err.context?.details || {};
        if (Object.keys(details).length > 0) {
          const fieldNames: Record<string, string> = {
            cpf: 'CPF',
            senha: 'Senha',
            telefone: 'Telefone',
            email: 'Email'
          };
          errorMessage = Object.entries(details)
            .map(([field, msgs]) => {
              const fieldName = fieldNames[field] || field;
              const messages = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
              return `${fieldName}: ${messages}`;
            })
            .join('\n');
        }
      }
      
      toast.error('Erro ao conceder acesso', {
        description: errorMessage,
      });
    } finally {
      setConcedendo(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Conceder Acesso ao Sistema"
      description={`Criando usuário do sistema para: ${membro?.nome || ''}`}
      onSubmit={handleFormSubmit}
      submitText={concedendo ? 'Concedendo...' : 'Conceder Acesso'}
      isLoading={concedendo}
      size="xl"
    >
      <Tabs defaultValue="acesso" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="acesso">Credenciais</TabsTrigger>
          <TabsTrigger value="permissoes">
            Permissões{" "}
            <span className={permissoesSelecionadas.length === 0 ? "text-destructive font-bold" : ""}>
              ({permissoesSelecionadas.length}/56)
            </span>
            {permissoesSelecionadas.length === 0 && <span className="ml-1">⚠️</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acesso" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
              {membro?.email && email !== membro.email && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  ⚠️ Você está alterando o email de <strong>{membro.email}</strong> para <strong>{email}</strong>
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {membro?.email 
                  ? 'Este é o email cadastrado. Você pode editá-lo se necessário.'
                  : 'Digite o email que será usado para login no sistema.'
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha de Acesso *</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha (mínimo 8 caracteres)"
              />
              
              {/* Indicador de força aparece ao começar a digitar */}
              {senha && senha.length > 0 && (
                <PasswordStrengthIndicator password={senha} />
              )}
            </div>

            {/* Funções/Roles (Controle Real) */}
            <div className="space-y-2">
              <Label>Funções no Sistema *</Label>
              <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                {[
                  { value: 'admin', label: 'Administrador', icon: '👑', desc: 'Acesso total ao sistema' },
                  { value: 'comercial', label: 'Comercial', icon: '🎯', desc: 'Vendas e propostas' },
                  { value: 'suporte', label: 'Suporte', icon: '🔧', desc: 'Operações e estoque' },
                  { value: 'operacional', label: 'Operacional', icon: '👷', desc: 'Execução de eventos' },
                  { value: 'financeiro', label: 'Financeiro', icon: '💰', desc: 'Finanças e cobranças' }
                ].map(role => (
                  <div key={role.value} className="flex items-start space-x-2">
                    <Checkbox
                      id={`role-${role.value}`}
                      checked={rolesSelecionadas.includes(role.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRolesSelecionadas([...rolesSelecionadas, role.value]);
                        } else {
                          setRolesSelecionadas(rolesSelecionadas.filter(r => r !== role.value));
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`role-${role.value}`}
                        className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <span>{role.icon}</span>
                        <span>{role.label}</span>
                      </label>
                      <p className="text-xs text-muted-foreground">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ As funções definem categorias, mas as <strong>permissões individuais</strong> controlam o acesso real
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ℹ️ Ao conceder acesso, este membro poderá fazer login na plataforma com as funções e permissões selecionadas.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4 mt-4">
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const permissoesSugeridas = new Set<string>();
                rolesSelecionadas.forEach(role => {
                  const preset = permissionsPresets[role as PresetType];
                  if (preset) {
                    preset.permissions.forEach(p => permissoesSugeridas.add(p));
                  }
                });
                setPermissoesSelecionadas(Array.from(permissoesSugeridas));
                toast.success('Permissões aplicadas', {
                  description: `${permissoesSugeridas.size} permissões sugeridas foram aplicadas.`,
                });
              }}
              disabled={rolesSelecionadas.length === 0}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Aplicar Sugestões das Funções Selecionadas
            </Button>
            {permissoesSelecionadas.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPermissoesSelecionadas([]);
                  toast.success('Permissões limpas', {
                    description: 'Todas as permissões foram desmarcadas.',
                  });
                }}
              >
                Limpar Todas
              </Button>
            )}
          </div>

          {permissoesSelecionadas.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção: Seleção Manual Obrigatória</AlertTitle>
              <AlertDescription>
                Você deve selecionar manualmente cada permissão que este usuário terá.
                Não há mais templates pré-definidos.
              </AlertDescription>
            </Alert>
          )}

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                Sugestões por Função
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <strong className="text-blue-900 dark:text-blue-300">🎯 Comercial:</strong>
                <p className="text-blue-700 dark:text-blue-400 ml-4">
                  eventos (criar, visualizar, editar próprios), clientes, contratos, financeiro (próprios)
                </p>
              </div>
              <div>
                <strong className="text-purple-900 dark:text-purple-300">🔧 Suporte:</strong>
                <p className="text-purple-700 dark:text-purple-400 ml-4">
                  estoque (completo), transportadoras, demandas, equipe, eventos (visualizar)
                </p>
              </div>
              <div>
                <strong className="text-green-900 dark:text-green-300">👷 Operacional:</strong>
                <p className="text-green-700 dark:text-green-400 ml-4">
                  eventos (visualizar), estoque (visualizar), demandas (criar)
                </p>
              </div>
            </CardContent>
          </Card>

          <GerenciarPermissoes
            userId=""
            userPermissions={permissoesSelecionadas}
            onPermissionsChange={setPermissoesSelecionadas}
          />
        </TabsContent>
      </Tabs>
    </FormSheet>
  );
}
