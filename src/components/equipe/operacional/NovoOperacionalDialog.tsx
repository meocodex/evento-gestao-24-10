import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { useCategorias } from '@/hooks/categorias';
import { useToast } from '@/hooks/use-toast';

interface NovoOperacionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoOperacionalDialog({ open, onOpenChange }: NovoOperacionalDialogProps) {
  const { criarOperacional } = useEquipe();
  const { funcoesEquipe, adicionarCategoria } = useCategorias();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    whatsapp: '',
    email: '',
    funcao_principal: '',
    tipo_vinculo: 'freelancer' as 'clt' | 'freelancer' | 'pj',
    cnpj_pj: '',
    observacoes: ''
  });

  const [criandoUsuario, setCriandoUsuario] = useState(false);
  const [mostrarAdicionarFuncao, setMostrarAdicionarFuncao] = useState(false);
  const [novaFuncaoNome, setNovaFuncaoNome] = useState('');

  const handleSubmit = async () => {
    if (!formData.nome || !formData.telefone || !formData.funcao_principal) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, telefone e função principal.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCriandoUsuario(true);

      // Criar apenas o operacional
      await criarOperacional.mutateAsync({
        ...formData,
        funcoes_secundarias: null,
        foto: null,
        documentos: null,
        status: 'ativo'
      });

      toast({
        title: 'Membro cadastrado!',
        description: `${formData.nome} foi cadastrado como operacional. Use "Conceder Acesso" para criar credenciais de sistema.`
      });

      // Resetar form
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        whatsapp: '',
        email: '',
        funcao_principal: '',
        tipo_vinculo: 'freelancer',
        cnpj_pj: '',
        observacoes: ''
      });
      setMostrarAdicionarFuncao(false);
      setNovaFuncaoNome('');
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

        <div className="space-y-4 mt-4">
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

              <div className="col-span-2">
                <div className="flex gap-2">
                  <div className="flex-1">
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
                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setMostrarAdicionarFuncao(true)}
                      title="Adicionar nova função"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {mostrarAdicionarFuncao && (
                  <div className="border rounded-lg p-3 space-y-2 mt-2">
                    <Label>Nova Função</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da função"
                        value={novaFuncaoNome}
                        onChange={(e) => setNovaFuncaoNome(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (novaFuncaoNome.trim()) {
                            await adicionarCategoria.mutateAsync({ 
                              tipo: 'funcoes_equipe', 
                              categoria: {
                                label: novaFuncaoNome,
                                value: novaFuncaoNome.toLowerCase().replace(/\s+/g, '_'),
                                ativa: true
                              }
                            });
                            setFormData({ ...formData, funcao_principal: novaFuncaoNome });
                            setNovaFuncaoNome('');
                            setMostrarAdicionarFuncao(false);
                          }
                        }}
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMostrarAdicionarFuncao(false);
                          setNovaFuncaoNome('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
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

              {formData.tipo_vinculo === 'pj' && (
                <div>
                  <Label htmlFor="cnpj_pj">CNPJ da Empresa</Label>
                  <Input
                    id="cnpj_pj"
                    value={formData.cnpj_pj}
                    onChange={(e) => setFormData({ ...formData, cnpj_pj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              )}

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

            </div>
          </div>

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
