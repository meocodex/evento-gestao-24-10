import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentUpload } from '@/components/shared/DocumentUpload';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { useEventos } from '@/contexts/EventosContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface NovoEnvioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoEnvioSheet({ open, onOpenChange }: NovoEnvioSheetProps) {
  const { criarEnvio, transportadoras } = useTransportadoras();
  const { eventos } = useEventos();
  const isMobile = useIsMobile();
  
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [transportadorasFiltradas, setTransportadorasFiltradas] = useState(transportadoras);
  const [formData, setFormData] = useState({
    transportadoraId: '',
    eventoId: '',
    tipo: 'ida' as 'ida' | 'volta',
    origem: '',
    destino: '',
    dataEntregaPrevista: '',
    valor: 0,
    formaPagamento: 'a_combinar' as 'antecipado' | 'na_entrega' | 'a_combinar',
    comprovantePagamento: '',
    observacoes: '',
  });

  useEffect(() => {
    if (eventoSelecionado) {
      const evento = eventos.find(e => e.id === eventoSelecionado);
      if (evento) {
        const transportadorasDisponiveis = transportadoras.filter(t =>
          t.rotasAtendidas.some(r =>
            r.cidadeDestino === evento.cidade &&
            r.estadoDestino === evento.estado &&
            r.ativa
          )
        );
        setTransportadorasFiltradas(transportadorasDisponiveis);
      }
    } else {
      setTransportadorasFiltradas(transportadoras);
    }
  }, [eventoSelecionado, eventos, transportadoras]);

  useEffect(() => {
    if (formData.transportadoraId && eventoSelecionado) {
      const transportadora = transportadoras.find(t => t.id === formData.transportadoraId);
      const evento = eventos.find(e => e.id === eventoSelecionado);
      
      if (transportadora && evento) {
        const rota = transportadora.rotasAtendidas.find(r =>
          r.cidadeDestino === evento.cidade &&
          r.estadoDestino === evento.estado
        );

        if (rota) {
          const dataEvento = new Date(evento.dataInicio);
          const dataEntregaPrevista = addDays(dataEvento, -rota.prazoEntrega);
          
          setFormData(prev => ({
            ...prev,
            origem: `${transportadora.endereco.cidade} - ${transportadora.endereco.estado}`,
            destino: `${evento.cidade} - ${evento.estado}`,
            dataEntregaPrevista: format(dataEntregaPrevista, 'yyyy-MM-dd'),
            valor: rota.valorBase || 0,
          }));
        }
      }
    }
  }, [formData.transportadoraId, eventoSelecionado, transportadoras, eventos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado) return;
    
    criarEnvio({ ...formData, eventoId: eventoSelecionado, status: 'pendente' });
    onOpenChange(false);
    setFormData({
      transportadoraId: '',
      eventoId: '',
      tipo: 'ida',
      origem: '',
      destino: '',
      dataEntregaPrevista: '',
      valor: 0,
      formaPagamento: 'a_combinar',
      comprovantePagamento: '',
      observacoes: '',
    });
    setEventoSelecionado('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Novo Envio
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            Registre um novo envio de materiais
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="evento" className="text-navy-700">Evento *</Label>
              <Select value={eventoSelecionado} onValueChange={setEventoSelecionado} required>
                <SelectTrigger className="border-navy-200">
                  <SelectValue placeholder="Selecione o evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nome} - {evento.cidade}/{evento.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transportadorasFiltradas.length === 0 && eventoSelecionado && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Nenhuma transportadora disponível para esta rota. Cadastre uma transportadora que atenda esta cidade.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="transportadora" className="text-navy-700">Transportadora *</Label>
              <Select
                value={formData.transportadoraId}
                onValueChange={(value) => setFormData({ ...formData, transportadoraId: value })}
                disabled={!eventoSelecionado}
                required
              >
                <SelectTrigger className="border-navy-200">
                  <SelectValue placeholder="Selecione a transportadora" />
                </SelectTrigger>
                <SelectContent>
                  {transportadorasFiltradas.map((transportadora) => (
                    <SelectItem key={transportadora.id} value={transportadora.id}>
                      {transportadora.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo" className="text-navy-700">Tipo de Envio *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'ida' | 'volta') => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="border-navy-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ida">Ida</SelectItem>
                  <SelectItem value="volta">Volta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origem" className="text-navy-700">Origem *</Label>
                <Input
                  id="origem"
                  required
                  value={formData.origem}
                  onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="destino" className="text-navy-700">Destino *</Label>
                <Input
                  id="destino"
                  required
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataEntregaPrevista" className="text-navy-700">Data Prevista de Entrega *</Label>
                <Input
                  id="dataEntregaPrevista"
                  type="date"
                  required
                  value={formData.dataEntregaPrevista}
                  onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="valor" className="text-navy-700">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="formaPagamento" className="text-navy-700">Forma de Pagamento *</Label>
              <Select
                value={formData.formaPagamento}
                onValueChange={(value: 'antecipado' | 'na_entrega' | 'a_combinar') => 
                  setFormData({ ...formData, formaPagamento: value })
                }
              >
                <SelectTrigger className="border-navy-200">
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
                <Label className="text-navy-700">Comprovante de Pagamento</Label>
                <DocumentUpload
                  onFileSelect={(file) => {
                    // TODO: Upload file to storage and get URL
                    console.log('File selected:', file);
                  }}
                  currentFile={formData.comprovantePagamento}
                />
              </div>
            )}

            <div>
              <Label htmlFor="observacoes" className="text-navy-700">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
                rows={3}
              />
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Envio
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
