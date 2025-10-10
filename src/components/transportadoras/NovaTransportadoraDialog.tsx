import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransportadoras } from '@/contexts/TransportadorasContext';

interface NovaTransportadoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaTransportadoraDialog({ open, onOpenChange }: NovaTransportadoraDialogProps) {
  const { criarTransportadora } = useTransportadoras();
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    razaoSocial: '',
    telefone: '',
    email: '',
    responsavel: '',
    status: 'ativa' as const,
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    criarTransportadora(formData);
    onOpenChange(false);
    setFormData({
      nome: '',
      cnpj: '',
      razaoSocial: '',
      telefone: '',
      email: '',
      responsavel: '',
      status: 'ativa',
      endereco: {
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transportadora</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Fantasia *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Endereço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={formData.endereco.rua}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.endereco.estado}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Transportadora</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
