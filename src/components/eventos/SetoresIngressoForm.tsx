import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SetorEvento, TipoIngresso, Lote } from '@/types/eventos';

interface SetoresIngressoFormProps {
  setores: SetorEvento[];
  onChange: (setores: SetorEvento[]) => void;
}

export function SetoresIngressoForm({ setores, onChange }: SetoresIngressoFormProps) {
  const adicionarSetor = () => {
    onChange([...setores, {
      id: `setor-${Date.now()}`,
      nome: '',
      capacidade: 0,
      tiposIngresso: [],
    }]);
  };

  const removerSetor = (setorId: string) => {
    onChange(setores.filter(s => s.id !== setorId));
  };

  const atualizarSetor = (setorId: string, campo: keyof SetorEvento, valor: any) => {
    onChange(setores.map(s => s.id === setorId ? { ...s, [campo]: valor } : s));
  };

  const adicionarTipoIngresso = (setorId: string) => {
    onChange(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: [...s.tiposIngresso, {
        id: `tipo-${Date.now()}`,
        nome: '',
        lotes: [
          { numero: 1, quantidade: 0, preco: 0, dataAberturaOnline: '', dataAberturaPDV: '', dataFechamentoOnline: '', dataFechamentoPDV: '' },
          { numero: 2, quantidade: 0, preco: 0, dataAberturaOnline: '', dataAberturaPDV: '', dataFechamentoOnline: '', dataFechamentoPDV: '' },
          { numero: 3, quantidade: 0, preco: 0, dataAberturaOnline: '', dataAberturaPDV: '', dataFechamentoOnline: '', dataFechamentoPDV: '' },
          { numero: 4, quantidade: 0, preco: 0, dataAberturaOnline: '', dataAberturaPDV: '', dataFechamentoOnline: '', dataFechamentoPDV: '' },
        ],
      }],
    } : s));
  };

  const removerTipoIngresso = (setorId: string, tipoId: string) => {
    onChange(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: s.tiposIngresso.filter(t => t.id !== tipoId),
    } : s));
  };

  const atualizarTipoIngresso = (setorId: string, tipoId: string, campo: keyof TipoIngresso, valor: any) => {
    onChange(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: s.tiposIngresso.map(t => t.id === tipoId ? { ...t, [campo]: valor } : t),
    } : s));
  };

  const atualizarLote = (setorId: string, tipoId: string, loteNumero: 1 | 2 | 3 | 4, campo: keyof Lote, valor: any) => {
    onChange(setores.map(s => s.id === setorId ? {
      ...s,
      tiposIngresso: s.tiposIngresso.map(t => t.id === tipoId ? {
        ...t,
        lotes: t.lotes.map(l => l.numero === loteNumero ? { ...l, [campo]: valor } : l),
      } : t),
    } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Setores e Ingressos</h3>
        <Button onClick={adicionarSetor} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Setor
        </Button>
      </div>

      {setores.map((setor, setorIdx) => (
        <Card key={setor.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Setor {setorIdx + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removerSetor(setor.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Setor</Label>
                <Input
                  value={setor.nome}
                  onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)}
                  placeholder="Ex: Pista, Camarote"
                />
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tipos de Ingresso</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adicionarTipoIngresso(setor.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tipo
                </Button>
              </div>

              {setor.tiposIngresso.map((tipo, tipoIdx) => (
                <Card key={tipo.id} className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={tipo.nome}
                        onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)}
                        placeholder="Ex: Inteira, Meia, VIP"
                        className="max-w-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerTipoIngresso(setor.id, tipo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Lotes</Label>
                      {tipo.lotes.map((lote) => (
                        <div key={lote.numero} className="grid grid-cols-3 gap-2 p-2 bg-background rounded">
                          <div>
                            <Label className="text-xs">{lote.numero}º Lote - Qtd</Label>
                            <Input
                              type="number"
                              value={lote.quantidade}
                              onChange={(e) => atualizarLote(setor.id, tipo.id, lote.numero, 'quantidade', Number(e.target.value))}
                              size={1}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={lote.preco}
                              onChange={(e) => atualizarLote(setor.id, tipo.id, lote.numero, 'preco', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Abertura Online</Label>
                            <Input
                              type="datetime-local"
                              value={lote.dataAberturaOnline}
                              onChange={(e) => atualizarLote(setor.id, tipo.id, lote.numero, 'dataAberturaOnline', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
