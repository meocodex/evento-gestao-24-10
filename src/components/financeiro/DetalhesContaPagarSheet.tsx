import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DetailsSheet } from '@/components/shared/sheets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Pencil, CheckCircle, Trash2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import type { ContaPagar, StatusBadgeConfig } from '@/types/financeiro';
import { useContasPagar } from '@/hooks/financeiro';
import { InfoGrid } from '@/components/shared/InfoGrid';

interface DetalhesContaPagarSheetProps {
  conta: ContaPagar;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditar: () => void;
  onMarcarPago: () => void;
  onExcluir: () => void;
}

const statusConfig: Record<string, StatusBadgeConfig> = {
  pendente: { variant: 'secondary', label: 'Pendente' },
  pago: { variant: 'default', label: 'Pago' },
  vencido: { variant: 'destructive', label: 'Vencido' },
  cancelado: { variant: 'outline', label: 'Cancelado' },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function DetalhesContaPagarSheet({
  conta,
  open,
  onOpenChange,
  onEditar,
  onMarcarPago,
  onExcluir,
}: DetalhesContaPagarSheetProps) {
  const { historicoRecorrencia } = useContasPagar();
  const { data: historico = [] } = conta.recorrencia !== 'unico' 
    ? historicoRecorrencia(conta.recorrencia_origem_id || conta.id)
    : { data: [] };

  const status = statusConfig[conta.status] || statusConfig.pendente;

  const tabs = [
    {
      value: 'dados',
      label: 'Dados',
      content: (
        <div className="space-y-6">
          <InfoGrid
            items={[
              { label: 'Descrição', value: conta.descricao },
              { label: 'Categoria', value: conta.categoria },
              { label: 'Fornecedor', value: conta.fornecedor || '-' },
              { label: 'Responsável', value: conta.responsavel || '-' },
              { 
                label: 'Valor', 
                value: formatCurrency(conta.valor),
                className: 'font-bold text-lg'
              },
              { label: 'Quantidade', value: `${conta.quantidade} x ${formatCurrency(conta.valor_unitario)}` },
              { label: 'Recorrência', value: conta.recorrencia.charAt(0).toUpperCase() + conta.recorrencia.slice(1) },
              { 
                label: 'Vencimento', 
                value: format(parseISO(conta.data_vencimento), "dd/MM/yyyy", { locale: ptBR })
              },
              conta.data_pagamento && { 
                label: 'Data Pagamento', 
                value: format(parseISO(conta.data_pagamento), "dd/MM/yyyy", { locale: ptBR })
              },
              conta.forma_pagamento && { label: 'Forma Pagamento', value: conta.forma_pagamento },
            ].filter(Boolean)}
          />

          {conta.observacoes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
              <p className="text-sm p-3 bg-muted/30 rounded-lg">{conta.observacoes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {conta.status !== 'pago' && conta.status !== 'cancelado' && (
              <Button onClick={onMarcarPago} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Marcar como Pago
              </Button>
            )}
            <Button variant="outline" onClick={onEditar} className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={onExcluir} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: 'anexos',
      label: 'Anexos',
      badge: conta.anexos?.length > 0 ? String(conta.anexos.length) : undefined,
      content: (
        <div className="space-y-4">
          {conta.anexos && conta.anexos.length > 0 ? (
            <div className="space-y-2">
              {conta.anexos.map((anexo, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{anexo.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {anexo.tipo} • {(anexo.tamanho / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" asChild>
                      <a href={anexo.url} download={anexo.nome}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum anexo</p>
          )}
        </div>
      ),
    },
  ];

  // Adicionar tab de histórico se for recorrente
  if (conta.recorrencia !== 'unico') {
    tabs.push({
      value: 'historico',
      label: 'Histórico',
      badge: historico.length > 1 ? String(historico.length) : undefined,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <RefreshCw className="h-4 w-4" />
            <span>Recorrência: {conta.recorrencia}</span>
          </div>
          {historico.length > 0 ? (
            <div className="space-y-2">
              {historico.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    item.id === conta.id ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">
                      {format(parseISO(item.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                      {item.id === conta.id && (
                        <span className="text-xs text-primary ml-2">(atual)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.data_pagamento 
                        ? `Pago em ${format(parseISO(item.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}`
                        : 'Não pago'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.valor)}</p>
                    <Badge variant={statusConfig[item.status]?.variant || 'secondary'} className="text-xs">
                      {statusConfig[item.status]?.label || item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Sem histórico de recorrências</p>
          )}
        </div>
      ),
    });
  }

  return (
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Conta a Pagar - ${status.label}`}
      description={conta.descricao}
      tabs={tabs}
      size="lg"
    />
  );
}
