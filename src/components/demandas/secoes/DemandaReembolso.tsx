import { useState } from 'react';
import { Demanda, TipoReembolso } from '@/types/demandas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileViewer } from '@/components/shared/FileViewer';
import { useDemandas } from '@/hooks/demandas';
import { useAuth } from '@/hooks/useAuth';
import { useEventosDespesas } from '@/hooks/useEventosDespesas';
import { AprovarReembolsoSheet } from '../AprovarReembolsoSheet';
import { MarcarPagoSheet } from '../MarcarPagoSheet';
import { RecusarReembolsoSheet } from '../RecusarReembolsoSheet';
import { format } from 'date-fns';
import { DollarSign, FileText, Paperclip, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DemandaReembolsoProps {
  demanda: Demanda;
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

const statusPagamentoConfig = {
  pendente: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500' },
  aprovado: { label: 'Aprovado', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500' },
  pago: { label: 'Pago', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500' },
  recusado: { label: 'Recusado', icon: XCircle, color: 'bg-red-500/10 text-red-500' }
};

export function DemandaReembolso({ demanda }: DemandaReembolsoProps) {
  const { aprovarReembolso, recusarReembolso, marcarReembolsoPago } = useDemandas();
  const { user } = useAuth();
  const vincularReembolso = useEventosDespesas(demanda.eventoRelacionado || '');
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [showRecusarDialog, setShowRecusarDialog] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; nome: string; tipo: string } | null>(null);

  const isAdmin = user?.role === 'admin';
  const dadosReembolso = demanda.dadosReembolso;

  if (!dadosReembolso) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nenhum dado de reembolso disponível
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = statusPagamentoConfig[dadosReembolso.statusPagamento].icon;

  const handleAprovarReembolso = (formaPagamento: string, observacoes?: string) => {
    aprovarReembolso.mutateAsync({ demandaId: demanda.id, formaPagamento, observacoes });
    setShowAprovarDialog(false);
  };

  const handleMarcarPago = (dataPagamento: string, comprovante?: string, observacoes?: string) => {
    marcarReembolsoPago.mutateAsync({ demandaId: demanda.id, dataPagamento, comprovante, observacoes });
    
    // Vincular reembolso ao financeiro do evento com dados completos
    if (demanda.eventoRelacionado && vincularReembolso) {
      vincularReembolso.vincularReembolsoADespesa(demanda.id, dadosReembolso, dataPagamento, comprovante);
    }
    
    setShowPagoDialog(false);
  };

  const handleRecusar = (motivo: string) => {
    recusarReembolso.mutateAsync({ demandaId: demanda.id, motivo });
    setShowRecusarDialog(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header do reembolso */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Detalhes do Reembolso
              </span>
              <span className="text-2xl font-bold text-purple-600">
                R$ {dadosReembolso.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Solicitante</p>
                <p className="font-medium">{dadosReembolso.membroEquipeNome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status do Pagamento</p>
                <Badge className={statusPagamentoConfig[dadosReembolso.statusPagamento].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusPagamentoConfig[dadosReembolso.statusPagamento].label}
                </Badge>
              </div>
              {dadosReembolso.formaPagamento && (
                <div>
                  <p className="text-muted-foreground">Forma de Pagamento</p>
                  <p className="font-medium uppercase">{dadosReembolso.formaPagamento}</p>
                </div>
              )}
              {dadosReembolso.dataPagamento && (
                <div>
                  <p className="text-muted-foreground">Data do Pagamento</p>
                  <p className="font-medium">
                    {format(new Date(dadosReembolso.dataPagamento), 'dd/MM/yyyy')}
                  </p>
                </div>
              )}
            </div>

            {dadosReembolso.observacoesPagamento && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm">{dadosReembolso.observacoesPagamento}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itens do reembolso */}
        <div className="space-y-3">
          <h4 className="font-semibold">Itens do Reembolso ({dadosReembolso.itens?.length || 0})</h4>
          <div className="space-y-3">
            {(dadosReembolso.itens || []).map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tipoReembolsoLabels[item.tipo]}</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{item.descricao}</p>
                  {item.observacoes && (
                    <p className="text-xs text-muted-foreground mb-3">Obs: {item.observacoes}</p>
                  )}
                  {item.anexos && item.anexos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {item.anexos.length} comprovante(s)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.anexos.map((anexo) => (
                          <Button
                            key={anexo.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile({ 
                                url: anexo.url, 
                                nome: anexo.nome, 
                                tipo: anexo.tipo || 'application/octet-stream' 
                              });
                              setFileViewerOpen(true);
                            }}
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            {anexo.nome}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ações administrativas */}
        {isAdmin && dadosReembolso.statusPagamento !== 'pago' && dadosReembolso.statusPagamento !== 'recusado' && (
          <div className="space-y-2">
            {dadosReembolso.statusPagamento === 'pendente' && (
              <>
                <Button 
                  onClick={() => setShowAprovarDialog(true)}
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar Reembolso
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowRecusarDialog(true)}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Recusar
                </Button>
              </>
            )}
            {dadosReembolso.statusPagamento === 'aprovado' && (
              <Button 
                onClick={() => setShowPagoDialog(true)}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Pago
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      <AprovarReembolsoSheet
        open={showAprovarDialog}
        onOpenChange={setShowAprovarDialog}
        onConfirm={handleAprovarReembolso}
        valorTotal={dadosReembolso.valorTotal}
      />

      <MarcarPagoSheet
        open={showPagoDialog}
        onOpenChange={setShowPagoDialog}
        onConfirm={handleMarcarPago}
        valorTotal={dadosReembolso.valorTotal}
      />

      <RecusarReembolsoSheet
        open={showRecusarDialog}
        onOpenChange={setShowRecusarDialog}
        onConfirm={handleRecusar}
      />

      {selectedFile && (
        <FileViewer
          fileUrl={selectedFile.url}
          fileName={selectedFile.nome}
          fileType={selectedFile.tipo}
          isOpen={fileViewerOpen}
          onClose={() => setFileViewerOpen(false)}
        />
      )}
    </>
  );
}
