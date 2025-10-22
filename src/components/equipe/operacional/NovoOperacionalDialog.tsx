import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEquipe } from '@/contexts/EquipeContext';
import { useCategorias } from '@/contexts/CategoriasContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemplatesPermissoes } from '@/components/configuracoes/TemplatesPermissoes';
import { GerenciarPermissoes } from '@/components/configuracoes/GerenciarPermissoes';

interface NovoOperacionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoOperacionalDialog({ open, onOpenChange }: NovoOperacionalDialogProps) {
  const { criarOperacional } = useEquipe();
  const { funcoesEquipe } = useCategorias();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    whatsapp: '',
    email: '',
    funcao_principal: '',
    tipo_vinculo: 'freelancer' as 'clt' | 'freelancer' | 'pj',
    observacoes: ''
  });

  const [concederAcesso, setConcederAcesso] = useState(false);
  const [senha, setSenha] = useState('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [criandoUsuario, setCriandoUsuario] = useState(false);

  const handleTemplateSelect = (permissions: string[]) => {
    setPermissoesSelecionadas(permissions);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.telefone || !formData.funcao_principal) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, telefone e função principal.',
        variant: 'destructive'
      });
      return;
    }

    if (concederAcesso && (!formData.email || !senha)) {
      toast({
        title: 'Acesso ao sistema',
        description: 'Para conceder acesso ao sistema, forneça email e senha.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCriandoUsuario(true);

      // 1. Criar operacional
      const operacionalCriado = await criarOperacional.mutateAsync({
        ...formData,
        funcoes_secundarias: null,
        foto: null,
        documentos: null,
        status: 'ativo'
      });

      // 2. Se conceder acesso, criar usuário
      if (concederAcesso && formData.email && senha) {
        const { data, error } = await supabase.functions.invoke('criar-operador', {
          body: {
            nome: formData.nome,
            email: formData.email,
            cpf: formData.cpf,
            telefone: formData.telefone,
            senha: senha,
            tipo: 'ambos', // operacional + sistema
            permissions: permissoesSelecionadas
          }
        });

        if (error) throw error;

        toast({
          title: 'Sucesso!',
          description: `Operacional criado e acesso ao sistema concedido.`
        });
      } else {
        toast({
          title: 'Operacional criado!',
          description: `${formData.nome} foi cadastrado com sucesso.`
        });
      }

      // Resetar form
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        whatsapp: '',
        email: '',
        funcao_principal: '',
        tipo_vinculo: 'freelancer',
        observacoes: ''
      });
      setConcederAcesso(false);
      setSenha('');
      setPermissoesSelecionadas([]);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar operacional',
        variant: 'destructive'
      });
    } finally {
      setCriandoUsuario(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Membro da Equipe Operacional</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
            <TabsTrigger value="acesso" disabled={!concederAcesso}>Acesso Sistema</TabsTrigger>
            <TabsTrigger value="permissoes" disabled={!concederAcesso}>Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="funcao">Função Principal *</Label>
                <Select value={formData.funcao_principal} onValueChange={(value) => setFormData({ ...formData, funcao_principal: value })}>
                  <SelectTrigger id="funcao">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcoesEquipe.map((funcao) => (
                      <SelectItem key={funcao.value} value={funcao.label}>
                        {funcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Vínculo *</Label>
                <Select value={formData.tipo_vinculo} onValueChange={(value: any) => setFormData({ ...formData, tipo_vinculo: value })}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clt">CLT</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="pj">PJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre o membro da equipe..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Separator className="my-2" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Conceder acesso ao sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que este operacional acesse a plataforma
                    </p>
                  </div>
                  <Switch checked={concederAcesso} onCheckedChange={setConcederAcesso} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="acesso" className="space-y-4 mt-4">
            <div className="space-y-4">
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
                O email já foi informado nos dados básicos. Este operacional terá tipo "Sistema + Operacional".
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
            disabled={criandoUsuario || !formData.nome || !formData.telefone || !formData.funcao_principal}
          >
            {criandoUsuario ? 'Criando...' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
