import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransportadoras } from '@/hooks/transportadoras';
import { Transportadora } from '@/types/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditarTransportadoraSheetProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarTransportadoraSheet({ transportadora, open, onOpenChange }: EditarTransportadoraSheetProps) {
  const { editarTransportadora } = useTransportadoras();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState(transportadora);

  useEffect(() => {
    setFormData(transportadora);
  }, [transportadora]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await editarTransportadora.mutateAsync({ id: transportadora.id, data: formData });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Editar Transportadora
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            Atualize as informações da transportadora
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-navy-700">Nome Fantasia</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-navy-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'ativa' | 'inativa') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="border-navy-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsavel" className="text-navy-700">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="telefone" className="text-navy-700">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-navy-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
              />
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
