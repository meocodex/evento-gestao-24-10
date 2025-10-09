import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { materiaisEstoque, SerialEstoque } from '@/lib/mock-data/estoque';

interface AlocarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  materialNome: string;
  quantidadeNecessaria: number;
  quantidadeJaAlocada: number;
  onAlocar: (data: {
    itemId: string;
    serial: string;
    tipoEnvio: 'antecipado' | 'comTecnicos';
    transportadora?: string;
    responsavel?: string;
  }) => void;
}

export function AlocarMaterialDialog({ 
  open, 
  onOpenChange, 
  itemId, 
  materialNome, 
  quantidadeNecessaria, 
  quantidadeJaAlocada, 
  onAlocar 
}: AlocarMaterialDialogProps) {
  const { toast } = useToast();
  const [tipoEnvio, setTipoEnvio] = useState<'antecipado' | 'comTecnicos'>('comTecnicos');
  const [serial, setSerial] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar material no estoque
  const materialEstoque = useMemo(() => {
    return materiaisEstoque.find(m => m.id === itemId);
  }, [itemId]);

  // Filtrar seriais disponíveis
  const serialsFiltrados = useMemo(() => {
    if (!materialEstoque) return [];
    
    return materialEstoque.seriais
      .filter(s => s.numero.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        // Disponíveis primeiro
        if (a.status === 'disponivel' && b.status !== 'disponivel') return -1;
        if (a.status !== 'disponivel' && b.status === 'disponivel') return 1;
        return a.numero.localeCompare(b.numero);
      });
  }, [materialEstoque, searchTerm]);

  const quantidadeRestante = quantidadeNecessaria - quantidadeJaAlocada;

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

    // Verificar se serial está disponível
    const serialSelecionado = serialsFiltrados.find(s => s.numero === serial);
    if (serialSelecionado?.status !== 'disponivel') {
      toast({
        title: 'Serial indisponível',
        description: 'Este serial não está disponível para alocação.',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se já atingiu quantidade necessária
    if (quantidadeJaAlocada >= quantidadeNecessaria) {
      toast({
        title: 'Quantidade excedida',
        description: 'Já foram alocados todos os materiais necessários.',
        variant: 'destructive',
      });
      return;
    }

    if (tipoEnvio === 'antecipado' && !transportadora.trim()) {
      toast({
        title: 'Transportadora obrigatória',
        description: 'Por favor, informe a transportadora.',
        variant: 'destructive',
      });
      return;
    }

    if (tipoEnvio === 'comTecnicos' && !responsavel.trim()) {
      toast({
        title: 'Responsável obrigatório',
        description: 'Por favor, informe o responsável.',
        variant: 'destructive',
      });
      return;
    }

    onAlocar({
      itemId,
      serial,
      tipoEnvio,
      transportadora: tipoEnvio === 'antecipado' ? transportadora : undefined,
      responsavel: tipoEnvio === 'comTecnicos' ? responsavel : undefined,
    });

    toast({
      title: 'Material alocado!',
      description: `Serial ${serial} alocado com sucesso.`,
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

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Alocados: {quantidadeJaAlocada} de {quantidadeNecessaria}
                </span>
                {quantidadeRestante > 0 && (
                  <Badge variant="secondary">
                    Restam {quantidadeRestante} para alocar
                  </Badge>
                )}
              </div>
              
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {!materialEstoque ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Material não encontrado no estoque
                  </p>
                ) : serialsFiltrados.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum serial encontrado
                  </p>
                ) : (
                  serialsFiltrados.map((serialItem) => (
                    <div
                      key={serialItem.numero}
                      onClick={() => serialItem.status === 'disponivel' && setSerial(serialItem.numero)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        serial === serialItem.numero
                          ? 'border-primary bg-primary/5'
                          : serialItem.status === 'disponivel'
                          ? 'hover:border-primary/50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{serialItem.numero}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {serialItem.localizacao}
                            {serialItem.eventoNome && ` • ${serialItem.eventoNome}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {serialItem.status === 'disponivel' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Disponível
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Em uso
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
