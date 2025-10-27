import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { useEstoque } from '@/hooks/estoque';
import { useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface AlocarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  materialNome: string;
  quantidadeNecessaria: number;
  quantidadeJaAlocada: number;
  onAlocar: (data: {
    itemId: string;
    tipoEnvio: 'antecipado' | 'com_tecnicos';
    serial: string;
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
  onAlocar,
}: AlocarMaterialDialogProps) {
  const { buscarMaterialPorId } = useEstoque();
  const queryClient = useQueryClient();
  const [tipoEnvio, setTipoEnvio] = useState<'antecipado' | 'com_tecnicos'>('antecipado');
  const [serial, setSerial] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [materialEstoque, setMaterialEstoque] = useState<any>(null);

  // Buscar material no estoque quando o dialog abrir
  useEffect(() => {
    if (open && itemId) {
      // Forçar refetch sempre que abrir
      buscarMaterialPorId(itemId).then(setMaterialEstoque);
      
      // Invalidar cache ao abrir para garantir dados frescos
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
    } else if (!open) {
      setMaterialEstoque(null);
    }
  }, [open, itemId, buscarMaterialPorId, queryClient]);

  // Filtrar seriais disponíveis - usar useMemo para evitar recalcular a cada render
  const serialsFiltrados = useMemo(() => {
    if (!materialEstoque?.seriais) return [];
    
    return materialEstoque.seriais
      .filter((s: any) => s.numero.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: any, b: any) => {
        // Disponíveis primeiro
        if (a.status === 'disponivel' && b.status !== 'disponivel') return -1;
        if (a.status !== 'disponivel' && b.status === 'disponivel') return 1;
        return a.numero.localeCompare(b.numero);
      });
  }, [materialEstoque?.seriais, searchTerm]);

  const quantidadeRestante = quantidadeNecessaria - quantidadeJaAlocada;

  const handleSubmit = () => {
    if (!serial) return;

    if (tipoEnvio === 'antecipado' && !transportadora) {
      return;
    }

    if (tipoEnvio === 'com_tecnicos' && !responsavel) {
      return;
    }

    onAlocar({
      itemId,
      tipoEnvio,
      serial,
      ...(tipoEnvio === 'antecipado' ? { transportadora } : { responsavel }),
    });

    // Limpar form
    setSerial('');
    setTransportadora('');
    setResponsavel('');
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alocar Material: {materialNome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade necessária</p>
                <p className="text-2xl font-bold">{quantidadeNecessaria}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Já alocado</p>
                <p className="text-2xl font-bold">{quantidadeJaAlocada}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restante</p>
                <p className="text-2xl font-bold text-primary">{quantidadeRestante}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Envio</Label>
            <Select value={tipoEnvio} onValueChange={(v) => setTipoEnvio(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="antecipado">Envio Antecipado</SelectItem>
                <SelectItem value="com_tecnicos">Com Técnicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Serial do Material</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[200px] mt-2">
              <div className="space-y-2">
                {serialsFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {!materialEstoque?.seriais?.length
                        ? 'Nenhum serial cadastrado para este material.'
                        : searchTerm
                        ? 'Nenhum serial encontrado com esse termo.'
                        : 'Nenhum serial disponível no momento.'}
                    </p>
                    {!materialEstoque?.seriais?.length && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Cadastre seriais em Estoque &gt; {materialNome}
                      </p>
                    )}
                  </div>
                ) : (
                  serialsFiltrados.map((s) => (
                    <Card
                      key={s.numero}
                      className={`cursor-pointer transition-colors ${
                        serial === s.numero
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      } ${s.status !== 'disponivel' ? 'opacity-50' : ''}`}
                      onClick={() => s.status === 'disponivel' && setSerial(s.numero)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{s.numero}</p>
                            <p className="text-sm text-muted-foreground">{s.localizacao}</p>
                            
                            {s.tags && s.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {s.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={
                              s.status === 'disponivel'
                                ? 'default'
                                : s.status === 'em-uso'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {s.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {tipoEnvio === 'antecipado' ? (
            <div className="space-y-2">
              <Label>Transportadora</Label>
              <Input
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
                placeholder="Nome da transportadora..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Nome do responsável..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !serial ||
              (tipoEnvio === 'antecipado' && !transportadora) ||
              (tipoEnvio === 'com_tecnicos' && !responsavel)
            }
          >
            Alocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
