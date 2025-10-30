import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect, useMemo } from 'react';
import { useEstoque } from '@/hooks/estoque';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEventosMateriaisAlocados } from '@/hooks/eventos';
import { useToast } from '@/hooks/use-toast';
import { RegistrarRetiradaDialog } from './RegistrarRetiradaDialog';
import { GerarDeclaracaoTransporteDialog } from './GerarDeclaracaoTransporteDialog';

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
  const { alocarMaterialLote, registrarRetirada, gerarDeclaracaoTransporte } = useEventosMateriaisAlocados(eventoId);
  const [tipoEnvio, setTipoEnvio] = useState<'antecipado' | 'com_tecnicos'>('antecipado');
  const [serialsSelecionados, setSerialsSelecionados] = useState<string[]>([]);
  const [transportadora, setTransportadora] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [materialEstoque, setMaterialEstoque] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [showRegistrarRetirada, setShowRegistrarRetirada] = useState(false);
  const [showGerarDeclaracao, setShowGerarDeclaracao] = useState(false);
  const [materiaisAlocadosTemp, setMateriaisAlocadosTemp] = useState<any[]>([]);

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

  const toggleSerial = (numero: string) => {
    setSerialsSelecionados(prev => {
      if (prev.includes(numero)) {
        return prev.filter(s => s !== numero);
      }
      
      if (prev.length >= quantidadeRestante) {
        toast({
          title: "Limite atingido",
          description: `Você já selecionou ${quantidadeRestante} ${quantidadeRestante === 1 ? 'serial' : 'seriais'} (quantidade necessária)`,
          variant: "destructive",
        });
        return prev;
      }
      
      return [...prev, numero];
    });
  };

  const limparFormulario = () => {
    setSerialsSelecionados([]);
    setTransportadora('');
    setResponsavel('');
    setSearchTerm('');
    setMateriaisAlocadosTemp([]);
  };

  const handleSubmitLote = async () => {
    if (serialsSelecionados.length === 0) return;

    if (tipoEnvio === 'antecipado' && !transportadora.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe a transportadora para envio antecipado (ou deixe vazio para retirada por terceiro)",
        variant: "destructive",
      });
      return;
    }

    if (tipoEnvio === 'com_tecnicos' && !responsavel) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o responsável pelo envio",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);

    try {
      const dados = serialsSelecionados.map(serial => ({
        item_id: itemId,
        nome: materialNome,
        tipo_envio: tipoEnvio,
        serial,
        ...(tipoEnvio === 'antecipado' ? { transportadora: transportadora || '' } : { responsavel }),
      }));

      await alocarMaterialLote.mutateAsync(dados);

      // Buscar materiais recém-alocados
      const { data: materiaisRecentes } = await supabase
        .from('eventos_materiais_alocados')
        .select('*')
        .eq('evento_id', eventoId)
        .in('serial', serialsSelecionados)
        .order('created_at', { ascending: false })
        .limit(serialsSelecionados.length);
      
      setMateriaisAlocadosTemp(materiaisRecentes || []);

      // Verificar se precisa gerar documento
      if (tipoEnvio === 'antecipado') {
        if (!transportadora || transportadora.trim() === '') {
          // Sem transportadora = Retirada por terceiro
          setShowRegistrarRetirada(true);
        } else {
          // Com transportadora = Envio via transportadora
          setShowGerarDeclaracao(true);
        }
      } else {
        // Com técnicos - não precisa documento
        limparFormulario();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao alocar em lote:', error);
    } finally {
      setIsProcessing(false);
      setProcessedCount(0);
    }
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
              {serialsFiltrados.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={serialsSelecionados.length === quantidadeRestante ? "default" : "secondary"}>
                      {serialsSelecionados.length} / {quantidadeRestante}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {serialsSelecionados.length === 1 ? 'serial selecionado' : 'seriais selecionados'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {serialsSelecionados.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSerialsSelecionados([])}
                      >
                        Limpar
                      </Button>
                    )}
                    {serialsFiltrados.some((s: any) => 
                      s.status === 'disponivel' && 
                      !serialsAlocadosNesteEvento.includes(s.numero) &&
                      !serialsAlocadosGlobal[s.numero]
                    ) && serialsSelecionados.length < quantidadeRestante && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const disponiveis = serialsFiltrados
                            .filter((s: any) => {
                              const jaAlocadoAqui = serialsAlocadosNesteEvento.includes(s.numero);
                              const alocadoEmOutro = serialsAlocadosGlobal[s.numero];
                              return s.status === 'disponivel' && !jaAlocadoAqui && !alocadoEmOutro;
                            })
                            .slice(0, quantidadeRestante - serialsSelecionados.length)
                            .map((s: any) => s.numero);
                          
                          setSerialsSelecionados(prev => [...prev, ...disponiveis]);
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto ({quantidadeRestante - serialsSelecionados.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}
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
                          serialsSelecionados.includes(s.numero)
                            ? 'border-primary bg-primary/10'
                            : jaAlocadoAqui
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : alocadoEmOutro
                            ? 'border-destructive/50 bg-destructive/5 opacity-60 cursor-not-allowed'
                            : podeSelecionar
                            ? 'hover:border-primary/50 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (jaAlocadoAqui || alocadoEmOutro || !podeSelecionar) return;
                          toggleSerial(s.numero);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Checkbox visível */}
                            {podeSelecionar && !jaAlocadoAqui && !alocadoEmOutro && (
                              <div className="flex-shrink-0">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  serialsSelecionados.includes(s.numero)
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/30'
                                }`}>
                                  {serialsSelecionados.includes(s.numero) && (
                                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                  )}
                                </div>
                              </div>
                            )}
                            
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
          <div className="flex-1">
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Alocando seriais...</span>
                  <span className="font-medium">
                    {processedCount} / {serialsSelecionados.length}
                  </span>
                </div>
                <Progress value={(processedCount / serialsSelecionados.length) * 100} />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitLote}
              disabled={
                isProcessing ||
                serialsSelecionados.length === 0 ||
                (tipoEnvio === 'antecipado' && !transportadora) ||
                (tipoEnvio === 'com_tecnicos' && !responsavel)
              }
            >
              {isProcessing 
                ? `Alocando... (${processedCount}/${serialsSelecionados.length})`
                : `Alocar ${serialsSelecionados.length} ${serialsSelecionados.length === 1 ? 'Serial' : 'Seriais'}`
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Dialogs de Documentos */}
      <RegistrarRetiradaDialog
        open={showRegistrarRetirada}
        onOpenChange={(open) => {
          setShowRegistrarRetirada(open);
          if (!open) {
            limparFormulario();
            onOpenChange(false);
          }
        }}
        materiais={materiaisAlocadosTemp}
        onConfirmar={async (dados) => {
          await registrarRetirada.mutateAsync({
            alocacaoIds: materiaisAlocadosTemp.map(m => m.id),
            retiradoPorNome: dados.retiradoPorNome,
            retiradoPorDocumento: dados.retiradoPorDocumento,
            retiradoPorTelefone: dados.retiradoPorTelefone,
          });
          setShowRegistrarRetirada(false);
          limparFormulario();
          onOpenChange(false);
        }}
      />

      <GerarDeclaracaoTransporteDialog
        open={showGerarDeclaracao}
        onOpenChange={(open) => {
          setShowGerarDeclaracao(open);
          if (!open) {
            limparFormulario();
            onOpenChange(false);
          }
        }}
        materiais={materiaisAlocadosTemp}
        cliente={null}
        transportadora={undefined}
        onConfirmar={async (dados) => {
          await gerarDeclaracaoTransporte.mutateAsync({
            alocacaoIds: materiaisAlocadosTemp.map(m => m.id),
            remetenteTipo: dados.remetenteTipo,
            remetenteMembroId: dados.remetenteMembroId,
            valoresDeclarados: dados.valoresDeclarados,
            observacoes: dados.observacoes,
          });
          setShowGerarDeclaracao(false);
          limparFormulario();
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
}
