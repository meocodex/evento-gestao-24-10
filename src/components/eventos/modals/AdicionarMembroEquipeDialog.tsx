import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AdicionarMembroEquipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: any) => void;
}

export function AdicionarMembroEquipeDialog({ open, onOpenChange, onAdicionar }: AdicionarMembroEquipeDialogProps) {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !funcao.trim() || !telefone.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    onAdicionar({ nome, funcao, telefone });

    toast({
      title: 'Membro adicionado!',
      description: 'O membro foi adicionado à equipe.',
    });
    
    setNome('');
    setFuncao('');
    setTelefone('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input 
              id="nome"
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="funcao">Função *</Label>
            <Input 
              id="funcao"
              value={funcao} 
              onChange={(e) => setFuncao(e.target.value)} 
              placeholder="Ex: Técnico de Som"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input 
              id="telefone"
              value={telefone} 
              onChange={(e) => setTelefone(e.target.value)} 
              placeholder="Ex: (65) 99999-9999"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
