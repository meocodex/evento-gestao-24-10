import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEquipe } from '@/contexts/EquipeContext';
import { useCategorias } from '@/contexts/CategoriasContext';

interface NovoOperacionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoOperacionalDialog({ open, onOpenChange }: NovoOperacionalDialogProps) {
  const { criarOperacional } = useEquipe();
  const { funcoesEquipe } = useCategorias();
  
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

  

  const handleSubmit = async () => {
    if (!formData.nome || !formData.telefone || !formData.funcao_principal) {
      return;
    }

    await criarOperacional.mutateAsync({
      ...formData,
      funcoes_secundarias: null,
      foto: null,
      documentos: null,
      status: 'ativo'
    });

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Membro da Equipe Operacional</DialogTitle>
        </DialogHeader>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={criarOperacional.isPending || !formData.nome || !formData.telefone || !formData.funcao_principal}
          >
            {criarOperacional.isPending ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
