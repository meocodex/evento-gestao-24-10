import { useState } from 'react';
import { DetailsSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Contrato, StatusContrato } from '@/types/contratos';
import { useContratos } from '@/hooks/contratos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Send, 
  Check, 
  X, 
  Clock,
  FileSignature,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  DollarSign,
  MapPin,
  LucideIcon
} from 'lucide-react';
import { useClientes } from '@/hooks/clientes';
import { useEventos } from '@/hooks/eventos';
import { gerarPDFContrato } from '@/utils/pdfGenerator';
import { InfoGridList } from '@/components/shared/InfoGrid';

interface DetalhesContratoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
  onEdit?: () => void;
  onConverter?: () => void;
}

const statusConfig: Record<StatusContrato, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: LucideIcon }> = {
  proposta: { label: 'Proposta', variant: 'secondary', icon: FileText },
  em_negociacao: { label: 'Em Negociação', variant: 'default', icon: Clock },
  aprovada: { label: 'Aprovada', variant: 'default', icon: CheckCircle2 },
  rascunho: { label: 'Rascunho', variant: 'secondary', icon: FileText },
  em_revisao: { label: 'Em Revisão', variant: 'default', icon: Clock },
  aguardando_assinatura: { label: 'Aguardando Assinatura', variant: 'default', icon: FileSignature },
  assinado: { label: 'Assinado', variant: 'default', icon: Check },
  cancelado: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
  expirado: { label: 'Expirado', variant: 'secondary', icon: X },
};

export function DetalhesContratoSheet({ open, onOpenChange, contrato, onEdit, onConverter }: DetalhesContratoSheetProps) {
  const { aprovarProposta } = useContratos();
  const { clientes } = useClientes();
  const { eventos } = useEventos();

  if (!contrato) return null;

  const cliente = clientes.find(c => c.id === contrato.clienteId);
  const evento = eventos.find(e => e.id === contrato.eventoId);
  const StatusIcon = statusConfig[contrato.status]?.icon || FileText;
  const isProposta = ['proposta', 'em_negociacao', 'aprovada'].includes(contrato.status);

  const assinadasCount = contrato.assinaturas.filter(a => a.assinado).length;
  const totalAssinaturas = contrato.assinaturas.length;

  // Tab: Dados
  const DadosTab = () => {
    const infoItems = [
      {
        icon: FileText,
        label: 'Tipo',
        value: <span className="capitalize">{contrato.tipo}</span>,
      },
      ...(cliente ? [{
        icon: User,
        label: 'Cliente',
        value: cliente.nome,
      }] : []),
      ...(evento ? [{
        icon: FileText,
        label: 'Evento',
        value: evento.nome,
      }] : []),
      ...(contrato.valor ? [{
        icon: DollarSign,
        label: 'Valor',
        value: contrato.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      }] : []),
      ...(isProposta && contrato.validade ? [{
        icon: Calendar,
        label: 'Validade',
        value: format(new Date(contrato.validade), "dd/MM/yyyy"),
      }] : []),
      ...(contrato.dataInicio ? [{
        icon: Calendar,
        label: 'Data Início',
        value: format(new Date(contrato.dataInicio), "dd/MM/yyyy"),
      }] : []),
      ...(contrato.dataFim ? [{
        icon: Calendar,
        label: 'Data Fim',
        value: format(new Date(contrato.dataFim), "dd/MM/yyyy"),
        separator: false,
      }] : []),
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant={statusConfig[contrato.status]?.variant || 'secondary'}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig[contrato.status]?.label || contrato.status}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {isProposta ? 'Proposta' : 'Contrato'} {contrato.numero}
          </p>
        </div>

        <InfoGridList items={infoItems} />
      
        {isProposta && contrato.dadosEvento && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold mb-3">Dados do Evento</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-medium">{contrato.dadosEvento.nome}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Local:</span>
                <p className="font-medium">{contrato.dadosEvento.local}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cidade:</span>
                <p className="font-medium">{contrato.dadosEvento.cidade}/{contrato.dadosEvento.estado}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data:</span>
                <p className="font-medium">
                  {format(new Date(contrato.dadosEvento.dataInicio), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {contrato.observacoes && (
        <>
          <Separator />
          <div>
            <span className="text-sm text-muted-foreground">Observações:</span>
            <p className="mt-1 text-sm">{contrato.observacoes}</p>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {contrato.status === 'proposta' && (
          <Button variant="default" onClick={async () => {
            await aprovarProposta.mutateAsync({ contratoId: contrato.id });
            onOpenChange(false);
          }}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar Proposta
          </Button>
        )}
        {contrato.status === 'aprovada' && onConverter && (
          <Button variant="default" onClick={onConverter}>
            <FileSignature className="mr-2 h-4 w-4" />
            Converter em Contrato
          </Button>
        )}
        {contrato.status === 'assinado' && (
          <Button variant="outline" onClick={() => gerarPDFContrato(contrato, 'download')}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        )}
        {(contrato.status === 'rascunho' || contrato.status === 'em_revisao' || contrato.status === 'proposta') && onEdit && (
          <Button onClick={onEdit}>
            Editar {isProposta ? 'Proposta' : 'Contrato'}
          </Button>
        )}
      </div>
    </div>
  );
};

  // Tab: Conteúdo
  const ConteudoTab = () => (
    <div className="bg-muted/30 p-6 rounded-md border max-h-[500px] overflow-y-auto">
      <div className="text-sm whitespace-pre-wrap">{contrato.conteudo}</div>
    </div>
  );

  // Tab: Assinaturas
  const AssinaturasTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Assinaturas</h4>
          <p className="text-sm text-muted-foreground">
            {assinadasCount} de {totalAssinaturas} assinadas
          </p>
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        {contrato.assinaturas.map((assinatura, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-medium">{assinatura.nome}</h5>
                  {assinatura.assinado ? (
                    <Badge variant="default" className="bg-green-500">
                      <Check className="mr-1 h-3 w-3" />
                      Assinado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Pendente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{assinatura.parte}</p>
                <p className="text-sm text-muted-foreground">{assinatura.email}</p>
                {assinatura.dataAssinatura && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Assinado em {format(new Date(assinatura.dataAssinatura), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tab: Histórico
  const HistoricoTab = () => (
    <div className="space-y-4">
      {contrato.aprovacoesHistorico?.map((item, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {index < (contrato.aprovacoesHistorico?.length || 0) - 1 && (
              <div className="w-0.5 h-full bg-border" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium capitalize">{item.acao}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm")} - {item.usuario}
            </p>
            {item.observacoes && (
              <p className="text-xs text-muted-foreground mt-1">{item.observacoes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    {
      value: 'dados',
      label: 'Dados',
      content: <DadosTab />
    },
    {
      value: 'conteudo',
      label: 'Conteúdo',
      content: <ConteudoTab />
    },
    {
      value: 'assinaturas',
      label: 'Assinaturas',
      badge: `${assinadasCount}/${totalAssinaturas}`,
      content: <AssinaturasTab />
    },
    {
      value: 'historico',
      label: 'Histórico',
      content: <HistoricoTab />
    }
  ];

  return (
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title={contrato.titulo}
      tabs={tabs}
      size="xl"
    />
  );
}
