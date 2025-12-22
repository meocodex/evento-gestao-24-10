import { useState, useEffect } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { useCategorias } from '@/hooks/categorias';
import { TipoVinculo, StatusOperacional } from '@/types/equipe';
import { OperacionalEquipe } from '@/types/equipe';

interface EditarOperacionalSheetProps {
  operacional: OperacionalEquipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarOperacionalSheet({ operacional, open, onOpenChange }: EditarOperacionalSheetProps) {
  const { editarOperacional } = useEquipe();
  const { funcoesEquipe, adicionarCategoria } = useCategorias();
  
  const [formData, setFormData] = useState({
    nome: operacional.nome,
    cpf: operacional.cpf || '',
    telefone: operacional.telefone,
    whatsapp: operacional.whatsapp || '',
    email: operacional.email || '',
    funcao_principal: operacional.funcao_principal,
    tipo_vinculo: operacional.tipo_vinculo,
    cnpj_pj: operacional.cnpj_pj || '',
    status: operacional.status,
    observacoes: operacional.observacoes || ''
  });
  const [mostrarAdicionarFuncao, setMostrarAdicionarFuncao] = useState(false);
  const [novaFuncaoNome, setNovaFuncaoNome] = useState('');

  useEffect(() => {
    setFormData({
      nome: operacional.nome,
      cpf: operacional.cpf || '',
      telefone: operacional.telefone,
      whatsapp: operacional.whatsapp || '',
      email: operacional.email || '',
      funcao_principal: operacional.funcao_principal,
      tipo_vinculo: operacional.tipo_vinculo,
      cnpj_pj: operacional.cnpj_pj || '',
      status: operacional.status,
      observacoes: operacional.observacoes || ''
    });
  }, [operacional]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone || !formData.funcao_principal) {
      return;
    }

    await editarOperacional.mutateAsync({
      id: operacional.id,
      ...formData
    });

    setFormData({
      nome: operacional.nome,
      cpf: operacional.cpf || '',
      telefone: operacional.telefone,
      whatsapp: operacional.whatsapp || '',
      email: operacional.email || '',
      funcao_principal: operacional.funcao_principal,
      tipo_vinculo: operacional.tipo_vinculo,
      cnpj_pj: operacional.cnpj_pj || '',
      status: operacional.status,
      observacoes: operacional.observacoes || ''
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      nome: operacional.nome,
      cpf: operacional.cpf || '',
      telefone: operacional.telefone,
      whatsapp: operacional.whatsapp || '',
      email: operacional.email || '',
      funcao_principal: operacional.funcao_principal,
      tipo_vinculo: operacional.tipo_vinculo,
      cnpj_pj: operacional.cnpj_pj || '',
      status: operacional.status,
      observacoes: operacional.observacoes || ''
    });
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Membro da Equipe"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={editarOperacional.isPending}
      submitText="Salvar Alterações"
      size="lg"
    >
      <div className="space-y-4">
        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="nome" className="text-sm">Nome Completo *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="h-9"
          />
        </div>

        {/* CPF + Telefone + WhatsApp */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="cpf" className="text-sm">CPF</Label>
            <MaskedInput
              id="cpf"
              mask="cpf"
              value={formData.cpf}
              onChange={(value) => setFormData({ ...formData, cpf: value })}
              className="h-9"
            />
          </div>

          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
            <MaskedInput
              id="telefone"
              mask="telefone"
              value={formData.telefone}
              onChange={(value) => setFormData({ ...formData, telefone: value })}
              className="h-9"
            />
          </div>

          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
            <MaskedInput
              id="whatsapp"
              mask="telefone"
              value={formData.whatsapp}
              onChange={(value) => setFormData({ ...formData, whatsapp: value })}
              className="h-9"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-9"
          />
        </div>

        {/* Função Principal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="funcao" className="text-sm">Função Principal *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setMostrarAdicionarFuncao(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Nova
            </Button>
          </div>
          <Select 
            value={formData.funcao_principal} 
            onValueChange={(value) => setFormData({ ...formData, funcao_principal: value })}
          >
            <SelectTrigger id="funcao" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {funcoesEquipe.map((funcao) => (
                <SelectItem key={funcao.value} value={funcao.label}>
                  {funcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mostrarAdicionarFuncao && (
            <div className="border rounded-lg p-3 space-y-2 mt-2">
              <Label className="text-sm">Nova Função</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da função"
                  value={novaFuncaoNome}
                  onChange={(e) => setNovaFuncaoNome(e.target.value)}
                  className="h-9"
                />
                <Button
                  size="sm"
                  className="h-9"
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
                  className="h-9"
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

        {/* Tipo de Vínculo + CNPJ/Status */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="tipo" className="text-sm">Tipo de Vínculo *</Label>
            <Select 
              value={formData.tipo_vinculo} 
              onValueChange={(value: TipoVinculo) => setFormData({ ...formData, tipo_vinculo: value })}
            >
              <SelectTrigger id="tipo" className="h-9">
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
            <div className="col-span-4 space-y-1.5">
              <Label htmlFor="cnpj_pj" className="text-sm">CNPJ da Empresa</Label>
              <MaskedInput
                id="cnpj_pj"
                mask="cnpj"
                value={formData.cnpj_pj}
                onChange={(value) => setFormData({ ...formData, cnpj_pj: value })}
                className="h-9"
              />
            </div>
          )}

          <div className={formData.tipo_vinculo === 'pj' ? 'col-span-4' : 'col-span-8'}>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: StatusOperacional) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <Label htmlFor="observacoes" className="text-sm">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    </FormSheet>
  );
}
