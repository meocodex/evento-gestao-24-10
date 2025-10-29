import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { TemplatesPermissoes } from '@/components/configuracoes/TemplatesPermissoes';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';
import { MembroEquipeUnificado } from '@/types/equipe';

interface ConcederAcessoSistemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro: MembroEquipeUnificado | null;
}

export function ConcederAcessoSistemaDialog({ open, onOpenChange, membro }: ConcederAcessoSistemaDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [concedendo, setConcedendo] = useState(false);

  // Inicializar email com o email do membro
  useEffect(() => {
    if (membro?.email) {
      setEmail(membro.email);
    }
  }, [membro]);

  const handleTemplateSelect = (permissions: string[]) => {
    setPermissoesSelecionadas(permissions);
  };

  const handleSubmit = async () => {
    if (!membro) {
      return;
    }

    if (!email || !senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o email e a senha.',
        variant: 'destructive'
      });
      return;
    }

    if (permissoesSelecionadas.length === 0) {
      toast({
        title: 'Permissões obrigatórias',
        description: 'Selecione pelo menos 1 permissão na aba "Permissões" antes de conceder acesso.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setConcedendo(true);

      const { data, error } = await supabase.functions.invoke('criar-operador', {
        body: {
          nome: membro.nome,
          email: email,
          cpf: membro.cpf,
          telefone: membro.telefone,
          senha: senha,
          tipo: 'ambos', // operacional + sistema
          permissions: permissoesSelecionadas
        }
      });

      if (error) {
        // Verificar se é erro de email duplicado
        if (error.message?.includes('already been registered') || error.message?.includes('email_exists') || error.message?.includes('User already registered')) {
          toast({
            title: 'Email já cadastrado',
            description: `${membro.nome} já possui acesso ao sistema. Use "Gerenciar Permissões" para editar as permissões.`,
            variant: 'destructive'
          });
          onOpenChange(false);
          return;
        }
        throw error;
      }

      toast({
        title: 'Acesso concedido!',
        description: `${membro.nome} agora tem acesso ao sistema.`
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
      queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });

      setEmail('');
      setSenha('');
      setPermissoesSelecionadas([]);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao conceder acesso',
        variant: 'destructive'
      });
    } finally {
      setConcedendo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conceder Acesso ao Sistema</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Criando usuário do sistema para: <strong>{membro?.nome}</strong>
          </p>
        </div>

        <Tabs defaultValue="acesso" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="acesso">Credenciais</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões *</TabsTrigger>
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
              <div>
                <Label htmlFor="senha">Senha de Acesso *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha que o usuário usará para login"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  ℹ️ Ao conceder acesso, este membro será convertido para tipo <strong>"Sistema + Operacional"</strong> e poderá fazer login na plataforma.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissoes" className="space-y-4 mt-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold">
                ⚠️ OBRIGATÓRIO: Selecione pelo menos 1 permissão antes de conceder acesso
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                Permissões selecionadas: <strong>{permissoesSelecionadas.length}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <TemplatesPermissoes onSelectTemplate={handleTemplateSelect} />
              <Separator />
              <GerenciarPermissoes
                userId=""
                userPermissions={permissoesSelecionadas}
                onPermissionsChange={setPermissoesSelecionadas}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={concedendo || !email || !senha || permissoesSelecionadas.length === 0}
          >
            {concedendo ? 'Concedendo...' : 'Conceder Acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
