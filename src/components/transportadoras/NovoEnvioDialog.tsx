import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { useEventos } from '@/contexts/EventosContext';
import { DocumentUpload } from '@/components/shared/DocumentUpload';

interface NovoEnvioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoEnvioDialog({ open, onOpenChange }: NovoEnvioDialogProps) {
  const { criarEnvio, transportadoras, buscarTransportadorasPorCidade } = useTransportadoras();
  const { eventos } = useEventos();
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [transportadorasFiltradas, setTransportadorasFiltradas] = useState(transportadoras);
  const [semRotas, setSemRotas] = useState(false);
  const [rotaSelecionada, setRotaSelecionada] = useState<any>(null);
  
  const [formData, setFormData] = useState<{
    transportadoraId: string;
    eventoId: string;
    tipo: 'ida' | 'volta';
    status: 'pendente' | 'em_transito' | 'entregue' | 'cancelado';
    dataEntregaPrevista: string;
    origem: string;
    destino: string;
    valor: string;
    formaPagamento: 'antecipado' | 'na_entrega' | 'a_combinar';
    comprovantePagamento: string;
    observacoes: string;
  }>({
    transportadoraId: '',
    eventoId: '',
    tipo: 'ida',
    status: 'pendente',
    dataEntregaPrevista: '',
    origem: '',
    destino: '',
    valor: '',
    formaPagamento: 'na_entrega',
    comprovantePagamento: '',
    observacoes: '',
  });

  useEffect(() => {
    if (eventoSelecionado) {
      const evento = eventos.find(e => e.id === eventoSelecionado);
      if (evento) {
        const transportadorasDisponiveis = buscarTransportadorasPorCidade(evento.cidade, evento.estado);
        setTransportadorasFiltradas(transportadorasDisponiveis);
        setSemRotas(transportadorasDisponiveis.length === 0);
        
        // Auto-preencher destino
        setFormData(prev => ({
          ...prev,
          eventoId: eventoSelecionado,
          destino: `${evento.cidade} - ${evento.estado}`,
        }));
      }
    }
  }, [eventoSelecionado, eventos, buscarTransportadorasPorCidade]);

  useEffect(() => {
    if (formData.transportadoraId) {
      const transportadora = transportadoras.find(t => t.id === formData.transportadoraId);
      const evento = eventos.find(e => e.id === eventoSelecionado);
      
      if (transportadora && evento) {
        // Buscar rota
        const rota = transportadora.rotasAtendidas.find(
          r => r.cidadeDestino.toLowerCase() === evento.cidade.toLowerCase() && 
               r.estadoDestino === evento.estado
        );

        setRotaSelecionada(rota);

        // Auto-preencher origem, valor e prazo
        setFormData(prev => ({
          ...prev,
          origem: `${transportadora.endereco.cidade} - ${transportadora.endereco.estado}`,
          valor: rota?.valorBase?.toString() || '',
        }));

        // Calcular data prevista baseado no prazo
        if (rota && evento.dataInicio) {
          const dataEvento = new Date(evento.dataInicio);
          dataEvento.setDate(dataEvento.getDate() - rota.prazoEntrega);
          setFormData(prev => ({
            ...prev,
            dataEntregaPrevista: dataEvento.toISOString().split('T')[0],
          }));
        }
      }
    }
  }, [formData.transportadoraId, transportadoras, eventos, eventoSelecionado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de comprovante para pagamento antecipado
    if (formData.formaPagamento === 'antecipado' && !formData.comprovantePagamento) {
      alert('Comprovante de pagamento é obrigatório para pagamento antecipado');
      return;
    }

    criarEnvio({
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
    });
    onOpenChange(false);
    
    // Reset
    setFormData({
      transportadoraId: '',
      eventoId: '',
      tipo: 'ida',
      status: 'pendente',
      dataEntregaPrevista: '',
      origem: '',
      destino: '',
      valor: '',
      formaPagamento: 'na_entrega',
      comprovantePagamento: '',
      observacoes: '',
    });
    setEventoSelecionado('');
    setSemRotas(false);
    setRotaSelecionada(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Envio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passo 1: Selecionar Evento */}
          <div>
            <Label htmlFor="evento">Evento *</Label>
            <Select
              value={eventoSelecionado}
              onValueChange={setEventoSelecionado}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento..." />
              </SelectTrigger>
              <SelectContent>
                {eventos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome} - {e.cidade}/{e.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alerta se não houver transportadoras */}
          {semRotas && eventoSelecionado && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Nenhuma transportadora cadastrada atende essa rota. Você pode criar o envio manualmente selecionando qualquer transportadora.
              </AlertDescription>
            </Alert>
          )}

          {eventoSelecionado && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transportadora">Transportadora *</Label>
                  <Select
                    value={formData.transportadoraId}
                    onValueChange={(value) => setFormData({ ...formData, transportadoraId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(semRotas ? transportadoras.filter(t => t.status === 'ativa') : transportadorasFiltradas).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                          {!semRotas && rotaSelecionada && t.id === formData.transportadoraId && 
                            ` (${rotaSelecionada.prazoEntrega} dia${rotaSelecionada.prazoEntrega > 1 ? 's' : ''})`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de Envio *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'ida' | 'volta') => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ida">Ida</SelectItem>
                      <SelectItem value="volta">Volta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Info da rota */}
              {rotaSelecionada && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    📍 Rota cadastrada: Prazo de {rotaSelecionada.prazoEntrega} dia{rotaSelecionada.prazoEntrega > 1 ? 's' : ''} 
                    {rotaSelecionada.valorBase && ` | Valor base: R$ ${rotaSelecionada.valorBase.toFixed(2)}`}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origem">Origem *</Label>
                  <Input
                    id="origem"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destino">Destino *</Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dataEntregaPrevista">Data Prevista *</Label>
                  <Input
                    id="dataEntregaPrevista"
                    type="date"
                    value={formData.dataEntregaPrevista}
                    onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                  <Select
                    value={formData.formaPagamento}
                    onValueChange={(value: 'antecipado' | 'na_entrega' | 'a_combinar') =>
                      setFormData({ ...formData, formaPagamento: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="antecipado">Antecipado</SelectItem>
                      <SelectItem value="na_entrega">Na Entrega</SelectItem>
                      <SelectItem value="a_combinar">A Combinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.formaPagamento === 'antecipado' && (
                  <div>
                    <Label>Comprovante de Pagamento *</Label>
                    <DocumentUpload
                      onFileSelect={(file) => {
                        const url = URL.createObjectURL(file);
                        setFormData({ ...formData, comprovantePagamento: url });
                      }}
                      currentFile={formData.comprovantePagamento}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!eventoSelecionado}>
              Criar Envio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
