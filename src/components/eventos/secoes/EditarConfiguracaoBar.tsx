import { useState } from 'react';
import { ConfiguracaoBar, EstabelecimentoBar } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, X, Save, Info, Store } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditarConfiguracaoBarProps {
  configuracao: ConfiguracaoBar;
  onSave: (config: ConfiguracaoBar) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditarConfiguracaoBar({ 
  configuracao, 
  onSave, 
  onCancel,
  isLoading 
}: EditarConfiguracaoBarProps) {
  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoBar[]>(
    configuracao.estabelecimentos || []
  );

  const adicionarEstabelecimento = () => {
    setEstabelecimentos([...estabelecimentos, {
      id: `estab-${Date.now()}`,
      nome: '',
      quantidadeMaquinas: 1,
    }]);
  };

  const removerEstabelecimento = (estabId: string) => {
    setEstabelecimentos(estabelecimentos.filter(e => e.id !== estabId));
  };

  const atualizarEstabelecimento = (
    estabId: string, 
    campo: 'nome' | 'quantidadeMaquinas' | 'cardapioUrl', 
    valor: string | number
  ) => {
    setEstabelecimentos(estabelecimentos.map(e =>
      e.id === estabId ? { ...e, [campo]: valor } : e
    ));
  };

  const handleSave = async () => {
    // Validar que todos os estabelecimentos tenham nome
    const estabsSemNome = estabelecimentos.filter(e => !e.nome.trim());
    if (estabsSemNome.length > 0) {
      toast({
        title: 'Erro de validação',
        description: 'Todos os estabelecimentos devem ter um nome.',
        variant: 'destructive',
      });
      return;
    }

    const novaConfig: ConfiguracaoBar = {
      ...configuracao,
      estabelecimentos: estabelecimentos.filter(e => e.nome.trim()),
    };

    await onSave(novaConfig);
  };

  const temErros = estabelecimentos.some(e => !e.nome.trim());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Editar Configuração de Bar
        </CardTitle>
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
            Configure os estabelecimentos de bar do evento
          </AlertDescription>
        </Alert>

        <Button onClick={adicionarEstabelecimento} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Estabelecimento
        </Button>

        {estabelecimentos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum estabelecimento configurado
          </div>
        )}

        {estabelecimentos.map((estab, idx) => (
          <Card key={estab.id} className="border-primary/20">
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Estabelecimento {idx + 1}</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removerEstabelecimento(estab.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Estabelecimento *</Label>
                  <Input
                    value={estab.nome}
                    onChange={(e) => atualizarEstabelecimento(estab.id, 'nome', e.target.value)}
                    placeholder="Ex: Bar Central, Bar Arena"
                    className={!estab.nome.trim() ? 'border-destructive' : ''}
                  />
                  {!estab.nome.trim() && (
                    <span className="text-xs text-destructive">Nome obrigatório</span>
                  )}
                </div>
                <div>
                  <Label>Quantidade de Máquinas</Label>
                  <Input
                    type="number"
                    min="1"
                    value={estab.quantidadeMaquinas}
                    onChange={(e) => atualizarEstabelecimento(estab.id, 'quantidadeMaquinas', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Link do Cardápio (opcional)</Label>
                <Input
                  value={estab.cardapioUrl || ''}
                  onChange={(e) => atualizarEstabelecimento(estab.id, 'cardapioUrl', e.target.value)}
                  placeholder="https://link-do-cardapio.com"
                  type="url"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}