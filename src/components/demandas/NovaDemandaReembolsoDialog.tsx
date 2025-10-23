import { useState } from 'react';
import { useDemandas } from '@/hooks/demandas';
import { useEventos } from '@/hooks/eventos';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TipoReembolso, ItemReembolso } from '@/types/demandas';
import { Plus, Trash2, Upload, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NovaDemandaReembolsoDialogProps {
  eventoId?: string;
}

const tipoReembolsoLabels: Record<TipoReembolso, string> = {
  frete: 'Frete',
  diaria: 'Diária',
  hospedagem: 'Hospedagem',
  combustivel: 'Combustível',
  locacao: 'Locação',
  alimentacao: 'Alimentação',
  outros: 'Outros'
};

export function NovaDemandaReembolsoDialog({ eventoId }: NovaDemandaReembolsoDialogProps) {
  const [open, setOpen] = useState(false);
  const { adicionarDemandaReembolso } = useDemandas();
  const { eventos } = useEventos();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedEventoId, setSelectedEventoId] = useState(eventoId || '');
  const [descricao, setDescricao] = useState('');
  const [itens, setItens] = useState<ItemReembolso[]>([]);
  
  // Item sendo editado
  const [itemDescricao, setItemDescricao] = useState('');
  const [itemTipo, setItemTipo] = useState<TipoReembolso>('outros');
  const [itemValor, setItemValor] = useState('');
  const [itemObservacoes, setItemObservacoes] = useState('');
  const [itemAnexos, setItemAnexos] = useState<string[]>([]);

  const eventosAtivos = eventos.filter(e => 
    ['orcamento', 'confirmado', 'em_preparacao', 'em_execucao'].includes(e.status)
  );

  const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);

  const handleAdicionarItem = () => {
    if (!itemDescricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Descrição do item é obrigatória',
        variant: 'destructive'
      });
      return;
    }

    const valor = parseFloat(itemValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor deve ser maior que zero',
        variant: 'destructive'
      });
      return;
    }

    if (itemAnexos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Anexe pelo menos um comprovante',
        variant: 'destructive'
      });
      return;
    }

    const novoItem: ItemReembolso = {
      id: `item-${Date.now()}`,
      descricao: itemDescricao,
      tipo: itemTipo,
      valor,
      observacoes: itemObservacoes || undefined,
      anexos: itemAnexos.map((nome, idx) => ({
        id: `anexo-${Date.now()}-${idx}`,
        nome,
        url: `/uploads/${nome}`,
        tipo: 'application/pdf',
        tamanho: 1024,
        uploadPor: user?.name || 'Usuário',
        uploadEm: new Date().toISOString()
      }))
    };

    setItens([...itens, novoItem]);
    
    // Limpar campos
    setItemDescricao('');
    setItemTipo('outros');
    setItemValor('');
    setItemObservacoes('');
    setItemAnexos([]);

    toast({
      title: 'Item adicionado!',
      description: 'Item de reembolso adicionado com sucesso.'
    });
  };

  const handleRemoverItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nomes = files.map(f => f.name);
    setItemAnexos([...itemAnexos, ...nomes]);
  };

  const handleCriarReembolso = async () => {
    if (!selectedEventoId) {
      toast({
        title: 'Erro',
        description: 'Selecione um evento',
        variant: 'destructive'
      });
      return;
    }

    if (itens.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um item de reembolso',
        variant: 'destructive'
      });
      return;
    }

    adicionarDemandaReembolso.mutateAsync({
      eventoId: selectedEventoId,
      eventoNome: eventos.find(e => e.id === selectedEventoId)?.nome || 'Evento',
      membroEquipeId: user?.id || 'user-1',
      membroEquipeNome: user?.name || 'Usuário',
      itens,
      observacoes: descricao
    });

    // Resetar
    setOpen(false);
    setSelectedEventoId(eventoId || '');
    setDescricao('');
    setItens([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <DollarSign className="h-4 w-4" />
          Nova Solicitação de Reembolso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Reembolso</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <div>
              <Label>Evento *</Label>
              <Select value={selectedEventoId} onValueChange={setSelectedEventoId} disabled={!!eventoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventosAtivos.map(evento => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nome} - {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição Geral (Opcional)</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Contexto adicional sobre o reembolso..."
                rows={2}
              />
            </div>
          </div>

          {/* Adicionar Item */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Item de Reembolso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={itemTipo} onValueChange={(v) => setItemTipo(v as TipoReembolso)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoReembolsoLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="text"
                    value={itemValor}
                    onChange={(e) => setItemValor(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input
                  value={itemDescricao}
                  onChange={(e) => setItemDescricao(e.target.value)}
                  placeholder="Ex: Frete para envio de equipamentos..."
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={itemObservacoes}
                  onChange={(e) => setItemObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Comprovantes * (Notas fiscais, recibos, etc.)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {itemAnexos.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {itemAnexos.length} arquivo(s) selecionado(s)
                  </div>
                )}
              </div>

              <Button onClick={handleAdicionarItem} className="w-full">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Itens do Reembolso ({itens.length})</span>
                  <span className="text-2xl text-primary">
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {itens.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{tipoReembolsoLabels[item.tipo]}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="font-bold text-primary">
                              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{item.descricao}</p>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground">Obs: {item.observacoes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.anexos.length} comprovante(s) anexado(s)
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCriarReembolso} disabled={itens.length === 0}>
            Criar Solicitação de Reembolso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
