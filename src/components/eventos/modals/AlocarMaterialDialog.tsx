import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { useEstoque } from '@/hooks/estoque';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEventosMateriaisAlocados } from '@/hooks/eventos';
import { useToast } from '@/hooks/use-toast';

interface AlocarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string;
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
  eventoId,
  itemId,
  materialNome,
  quantidadeNecessaria,
  quantidadeJaAlocada,
  onAlocar,
}: AlocarMaterialDialogProps) {
  const { buscarMaterialPorId } = useEstoque();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tipoEnvio, setTipoEnvio] = useState<'antecipado' | 'com_tecnicos'>('antecipado');
  const [serial, setSerial] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [materialEstoque, setMaterialEstoque] = useState<any>(null);

  // Buscar materiais já alocados neste evento
  const { materiaisAlocados } = useEventosMateriaisAlocados(eventoId);

  // Buscar TODOS os materiais alocados (qualquer evento)
  const { data: todosMateriaisAlocados } = useQuery({
    queryKey: ['todos-materiais-alocados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .select('serial, evento_id, eventos(nome)');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

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

  // Mapear seriais já alocados neste evento
  const serialsAlocadosNesteEvento = useMemo(() => {
    return materiaisAlocados
      .filter(m => m.item_id === itemId)
      .map(m => m.serial);
  }, [materiaisAlocados, itemId]);

  // Mapear seriais alocados em qualquer evento
  const serialsAlocadosGlobal = useMemo(() => {
    return (todosMateriaisAlocados || []).reduce((acc, m: any) => {
      acc[m.serial] = {
        eventoId: m.evento_id,
        eventoNome: m.eventos?.nome || 'Evento desconhecido'
      };
      return acc;
    }, {} as Record<string, { eventoId: string; eventoNome: string }>);
  }, [todosMateriaisAlocados]);

  // Filtrar e ordenar seriais
  const serialsFiltrados = useMemo(() => {
    if (!materialEstoque?.seriais) return [];
    
    const seriais = materialEstoque.seriais
      .filter((s: any) => {
        const matchSearch = s.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
      })
      .sort((a: any, b: any) => {
        // Ordenar: já alocados aqui primeiro (verde), depois disponíveis, depois bloqueados
        const aAlocadoAqui = serialsAlocadosNesteEvento.includes(a.numero);
        const bAlocadoAqui = serialsAlocadosNesteEvento.includes(b.numero);
        const aAlocadoOutro = serialsAlocadosGlobal[a.numero] && serialsAlocadosGlobal[a.numero].eventoId !== eventoId;
        const bAlocadoOutro = serialsAlocadosGlobal[b.numero] && serialsAlocadosGlobal[b.numero].eventoId !== eventoId;
        
        if (aAlocadoAqui && !bAlocadoAqui) return -1;
        if (!aAlocadoAqui && bAlocadoAqui) return 1;
        if (a.status === 'disponivel' && !aAlocadoOutro && (b.status !== 'disponivel' || bAlocadoOutro)) return -1;
        if (b.status === 'disponivel' && !bAlocadoOutro && (a.status !== 'disponivel' || aAlocadoOutro)) return 1;
        return a.numero.localeCompare(b.numero);
      });

    return seriais;
  }, [materialEstoque, searchTerm, serialsAlocadosNesteEvento, serialsAlocadosGlobal, eventoId]);

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
                  serialsFiltrados.map((s: any) => {
                    const jaAlocadoAqui = serialsAlocadosNesteEvento.includes(s.numero);
                    const alocadoEmOutro = serialsAlocadosGlobal[s.numero] && 
                                          serialsAlocadosGlobal[s.numero].eventoId !== eventoId;
                    const podeSelecionar = s.status === 'disponivel' && !jaAlocadoAqui && !alocadoEmOutro;

                    return (
                      <Card
                        key={s.numero}
                        className={`transition-colors ${
                          serial === s.numero
                            ? 'border-primary bg-primary/5'
                            : jaAlocadoAqui
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : alocadoEmOutro
                            ? 'border-destructive/50 bg-destructive/5 opacity-60 cursor-not-allowed'
                            : podeSelecionar
                            ? 'hover:border-primary/50 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (jaAlocadoAqui) {
                            toast({
                              title: "Material já alocado",
                              description: "Este serial já está alocado neste evento",
                              variant: "default",
                            });
                            return;
                          }
                          if (alocadoEmOutro) {
                            toast({
                              title: "Material indisponível",
                              description: `Este serial está alocado em: ${serialsAlocadosGlobal[s.numero].eventoNome}`,
                              variant: "destructive",
                            });
                            return;
                          }
                          if (podeSelecionar) {
                            setSerial(s.numero);
                          }
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">{s.numero}</p>
                                {jaAlocadoAqui && (
                                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Já alocado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {s.localizacao}
                              </p>
                              {alocadoEmOutro && (
                                <Badge variant="destructive" className="mt-1 flex items-center gap-1 w-fit">
                                  <Lock className="h-3 w-3" />
                                  Alocado em: {serialsAlocadosGlobal[s.numero].eventoNome}
                                </Badge>
                              )}
                              {s.tags && s.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {s.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {!jaAlocadoAqui && !alocadoEmOutro && (
                              <Badge
                                variant={
                                  s.status === 'disponivel'
                                    ? 'default'
                                    : s.status === 'em-uso'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="shrink-0"
                              >
                                {s.status === 'disponivel'
                                  ? 'Disponível'
                                  : s.status === 'em-uso'
                                  ? 'Em Uso'
                                  : 'Manutenção'}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
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
