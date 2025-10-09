import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Search } from 'lucide-react';

interface AlocarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialNome: string;
  onAlocar: (data: any) => void;
}

export function AlocarMaterialDialog({ open, onOpenChange, materialNome, onAlocar }: AlocarMaterialDialogProps) {
  const { toast } = useToast();
  const [tipoEnvio, setTipoEnvio] = useState<'antecipado' | 'comTecnicos'>('comTecnicos');
  const [serial, setSerial] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock de materiais em estoque
  const materiaisEstoque = [
    { id: '1', nome: materialNome, serial: 'SN001', disponivel: true },
    { id: '2', nome: materialNome, serial: 'SN002', disponivel: true },
    { id: '3', nome: materialNome, serial: 'SN003', disponivel: false },
  ].filter(m => m.serial.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serial) {
      toast({
        title: 'Serial obrigatório',
        description: 'Por favor, selecione um serial do estoque.',
        variant: 'destructive',
      });
      return;
    }

    if (tipoEnvio === 'antecipado' && !transportadora) {
      toast({
        title: 'Transportadora obrigatória',
        description: 'Por favor, informe a transportadora.',
        variant: 'destructive',
      });
      return;
    }

    if (tipoEnvio === 'comTecnicos' && !responsavel) {
      toast({
        title: 'Responsável obrigatório',
        description: 'Por favor, informe o responsável.',
        variant: 'destructive',
      });
      return;
    }

    onAlocar({
      tipoEnvio,
      serial,
      transportadora,
      responsavel,
    });

    toast({
      title: 'Material alocado!',
      description: 'O material foi alocado com sucesso.',
    });
    
    // Reset form
    setSerial('');
    setTransportadora('');
    setResponsavel('');
    setSearchTerm('');
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alocar Material: {materialNome}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Tipo de Envio *</Label>
              <Select value={tipoEnvio} onValueChange={(v) => setTipoEnvio(v as 'antecipado' | 'comTecnicos')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comTecnicos">Com Técnicos</SelectItem>
                  <SelectItem value="antecipado">Envio Antecipado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="searchSerial">Buscar no Estoque</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="searchSerial"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Buscar por serial..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {materiaisEstoque.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum material encontrado no estoque
                </p>
              ) : (
                materiaisEstoque.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => material.disponivel && setSerial(material.serial)}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      serial === material.serial
                        ? 'border-primary bg-primary/5'
                        : material.disponivel
                        ? 'hover:border-primary/50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{material.serial}</span>
                      </div>
                      <span className={`text-xs ${material.disponivel ? 'text-green-600' : 'text-red-600'}`}>
                        {material.disponivel ? 'Disponível' : 'Em uso'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {tipoEnvio === 'antecipado' && (
              <div>
                <Label htmlFor="transportadora">Transportadora *</Label>
                <Input 
                  id="transportadora"
                  value={transportadora} 
                  onChange={(e) => setTransportadora(e.target.value)} 
                  placeholder="Ex: Correios, Fedex..."
                  required={tipoEnvio === 'antecipado'}
                />
              </div>
            )}

            {tipoEnvio === 'comTecnicos' && (
              <div>
                <Label htmlFor="responsavel">Técnico Responsável *</Label>
                <Input 
                  id="responsavel"
                  value={responsavel} 
                  onChange={(e) => setResponsavel(e.target.value)} 
                  placeholder="Nome do técnico..."
                  required={tipoEnvio === 'comTecnicos'}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Alocar Material</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
