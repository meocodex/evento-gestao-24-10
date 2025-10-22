import { useState } from 'react';
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

  const handleTemplateSelect = (permissions: string[]) => {
    setPermissoesSelecionadas(permissions);
  };

  const handleSubmit = async () => {
    if (!membro || !email || !senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha email e senha.',
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

      if (error) throw error;

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
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
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
              </div>
              <div>
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha de acesso"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Este operacional será convertido para tipo "Sistema + Operacional" e terá acesso completo à plataforma.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="permissoes" className="space-y-4 mt-4">
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
            disabled={concedendo || !email || !senha}
          >
            {concedendo ? 'Concedendo...' : 'Conceder Acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
