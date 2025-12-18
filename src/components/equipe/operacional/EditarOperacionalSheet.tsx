import { useState, useEffect } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { useCategorias } from '@/hooks/categorias';
import { TipoVinculo, StatusOperacional } from '@/types/equipe';
import { OperacionalEquipe } from '@/types/equipe';
import { formatarCPF, formatarCNPJ, formatarTelefone } from '@/lib/formatters';

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
      size="xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: formatarTelefone(e.target.value) })}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="funcao">Função Principal *</Label>
              <Select value={formData.funcao_principal} onValueChange={(value) => setFormData({ ...formData, funcao_principal: value })}>
                <SelectTrigger id="funcao">
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
          <Select value={formData.tipo_vinculo} onValueChange={(value: TipoVinculo) => setFormData({ ...formData, tipo_vinculo: value })}>
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
              onChange={(e) => setFormData({ ...formData, cnpj_pj: formatarCNPJ(e.target.value) })}
              placeholder="00.000.000/0001-00"
              maxLength={18}
            />
          </div>
        )}

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value: StatusOperacional) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </FormSheet>
  );
}
