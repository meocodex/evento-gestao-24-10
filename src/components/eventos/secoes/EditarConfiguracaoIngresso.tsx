import { useState } from 'react';
import { ConfiguracaoIngresso, SetorEvento, TipoIngresso } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, X, Save, Info, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditarConfiguracaoIngressoProps {
  configuracao: ConfiguracaoIngresso;
  onSave: (config: ConfiguracaoIngresso) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditarConfiguracaoIngresso({ 
  configuracao, 
  onSave, 
  onCancel,
  isLoading 
}: EditarConfiguracaoIngressoProps) {
  const [setores, setSetores] = useState<SetorEvento[]>(configuracao.setores || []);

  const adicionarSetor = () => {
    setSetores([...setores, {
      id: `setor-${Date.now()}`,
      nome: '',
      capacidade: 0,
      tiposIngresso: [],
    }]);
  };

  const removerSetor = (setorId: string) => {
    setSetores(setores.filter(s => s.id !== setorId));
  };

  const atualizarSetor = (setorId: string, campo: 'nome' | 'capacidade', valor: string | number) => {
    setSetores(setores.map(s => 
      s.id === setorId ? { ...s, [campo]: valor } : s
    ));
  };

  const adicionarTipoIngresso = (setorId: string) => {
    setSetores(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: [...s.tiposIngresso, {
        id: `tipo-${Date.now()}`,
        nome: '',
        lotes: [],
      }],
    } : s));
  };

  const removerTipoIngresso = (setorId: string, tipoId: string) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.filter(t => t.id !== tipoId),
        };
      }
      return s;
    }));
  };

  const atualizarTipoIngresso = (setorId: string, tipoId: string, campo: 'nome', valor: string) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.map(t =>
            t.id === tipoId ? { ...t, [campo]: valor } : t
          ),
        };
      }
      return s;
    }));
  };

  const atualizarLote = (
    setorId: string, 
    tipoId: string, 
    numeroLote: number, 
    campo: 'quantidade' | 'preco' | 'dataAberturaOnline' | 'dataFechamentoOnline', 
    valor: string | number
  ) => {
    setSetores(setores.map(s => {
      if (s.id === setorId) {
        return {
          ...s,
          tiposIngresso: s.tiposIngresso.map(t => {
            if (t.id === tipoId) {
              const loteExistente = t.lotes.findIndex(l => l.numero === numeroLote);
              
              if (loteExistente >= 0) {
                const novosLotes = [...t.lotes];
                const valorConvertido = (campo === 'quantidade' || campo === 'preco') 
                  ? Number(valor) 
                  : String(valor);
                novosLotes[loteExistente] = {
                  ...novosLotes[loteExistente],
                  [campo]: valorConvertido,
                };
                return { ...t, lotes: novosLotes as typeof t.lotes };
              } else {
                return {
                  ...t,
                  lotes: [
                    ...t.lotes,
                    {
                      numero: numeroLote as 1 | 2 | 3 | 4,
                      quantidade: campo === 'quantidade' ? Number(valor) : 0,
                      preco: campo === 'preco' ? Number(valor) : 0,
                      dataAberturaOnline: campo === 'dataAberturaOnline' ? String(valor) : '',
                      dataAberturaPDV: '',
                      dataFechamentoOnline: campo === 'dataFechamentoOnline' ? String(valor) : '',
                      dataFechamentoPDV: '',
                    },
                  ],
                };
              }
            }
            return t;
          }),
        };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    // Validar que todos os setores tenham nome
    const setoresSemNome = setores.filter(s => !s.nome.trim());
    if (setoresSemNome.length > 0) {
      toast({
        title: 'Erro de validação',
        description: 'Todos os setores devem ter um nome.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipos de ingresso
    const tiposSemNome = setores.flatMap(s => 
      s.tiposIngresso.filter(t => !t.nome.trim())
    );
    if (tiposSemNome.length > 0) {
      toast({
        title: 'Erro de validação',
        description: 'Todos os tipos de ingresso devem ter um nome.',
        variant: 'destructive',
      });
      return;
    }

    const novaConfig: ConfiguracaoIngresso = {
      ...configuracao,
      setores: setores.filter(s => s.nome.trim()),
    };

    await onSave(novaConfig);
  };

  const temErros = setores.some(s => !s.nome.trim() || s.tiposIngresso.some(t => !t.nome.trim()));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Editar Configuração de Ingressos</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading || temErros}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Configure os setores do evento e os tipos de ingressos para cada setor
          </AlertDescription>
        </Alert>

        <Button onClick={adicionarSetor} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Setor
        </Button>

        {setores.map((setor, idx) => (
          <Card key={setor.id} className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Setor {idx + 1}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removerSetor(setor.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Setor *</Label>
                  <Input
                    value={setor.nome}
                    onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)}
                    placeholder="Ex: Pista, Camarote"
                    className={!setor.nome.trim() ? 'border-destructive' : ''}
                  />
                  {!setor.nome.trim() && (
                    <span className="text-xs text-destructive">Nome obrigatório</span>
                  )}
                </div>
                <div>
                  <Label>Capacidade</Label>
                  <Input
                    type="number"
                    value={setor.capacidade}
                    onChange={(e) => atualizarSetor(setor.id, 'capacidade', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Tipos de Ingresso */}
              {setor.tiposIngresso.length > 0 && (
                <div className="space-y-3 mt-4">
                  <Label className="font-semibold">Tipos de Ingresso</Label>
                  {setor.tiposIngresso.map((tipo, tipoIdx) => (
                    <Card key={tipo.id} className="bg-muted/50">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="font-medium">Tipo {tipoIdx + 1}</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removerTipoIngresso(setor.id, tipo.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Nome *</Label>
                          <Input
                            value={tipo.nome}
                            onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)}
                            placeholder="Ex: Meia-entrada, Inteira, VIP"
                            className={!tipo.nome.trim() ? 'border-destructive' : ''}
                          />
                          {!tipo.nome.trim() && (
                            <span className="text-xs text-destructive">Nome obrigatório</span>
                          )}
                        </div>
                        
                        {/* Lotes */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Lotes</Label>
                          {[1, 2, 3, 4].map((numeroLote) => {
                            const lote = tipo.lotes.find(l => l.numero === numeroLote);
                            const temDados = lote && (lote.quantidade > 0 || lote.preco > 0);
                            
                            // Mostrar lote 1 sempre, e outros apenas se tiverem dados ou se o anterior tiver
                            const loteAnterior = tipo.lotes.find(l => l.numero === (numeroLote - 1) as 1|2|3|4);
                            const mostrar = numeroLote === 1 || temDados || (loteAnterior && (loteAnterior.quantidade > 0 || loteAnterior.preco > 0));
                            
                            if (!mostrar) return null;
                            
                            return (
                              <div key={numeroLote} className="p-3 border rounded-lg bg-background space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Lote {numeroLote}</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <Label className="text-xs">Quantidade</Label>
                                    <Input
                                      type="number"
                                      placeholder="Qtd"
                                      value={lote?.quantidade || ''}
                                      onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote, 'quantidade', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Preço (R$)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0,00"
                                      value={lote?.preco || ''}
                                      onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote, 'preco', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Abertura</Label>
                                    <Input
                                      type="date"
                                      value={lote?.dataAberturaOnline || ''}
                                      onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote, 'dataAberturaOnline', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Fechamento</Label>
                                    <Input
                                      type="date"
                                      value={lote?.dataFechamentoOnline || ''}
                                      onChange={(e) => atualizarLote(setor.id, tipo.id, numeroLote, 'dataFechamentoOnline', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => adicionarTipoIngresso(setor.id)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tipo de Ingresso
              </Button>
            </CardContent>
          </Card>
        ))}

        {temErros && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Preencha o nome de todos os setores e tipos de ingresso para salvar.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}