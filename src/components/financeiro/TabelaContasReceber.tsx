import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Pencil, Trash2, CheckCircle, Repeat, FileText, FileSpreadsheet, FileX2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { exportarContasReceberPDF, exportarContasReceberExcel } from '@/utils/exportFinanceiro';
import type { ContaReceber, StatusBadgeConfig } from '@/types/financeiro';

interface TabelaContasReceberProps {
  contas: ContaReceber[];
  onDetalhes: (conta: ContaReceber) => void;
  onEditar: (conta: ContaReceber) => void;
  onMarcarRecebido: (conta: ContaReceber) => void;
  onExcluir: (id: string) => void;
}

export function TabelaContasReceber({ contas, onDetalhes, onEditar, onMarcarRecebido, onExcluir }: TabelaContasReceberProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, StatusBadgeConfig> = {
      pendente: { variant: 'outline', label: 'Pendente' },
      recebido: { variant: 'default', label: 'Recebido' },
      vencido: { variant: 'destructive', label: 'Vencido' },
      cancelado: { variant: 'secondary', label: 'Cancelado' },
    };
    const { variant, label } = variants[status] || variants.pendente;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (contas.length === 0) {
    return (
      <EmptyState
        icon={FileX2}
        title="Nenhuma conta encontrada"
        description="Não há contas a receber que correspondam aos filtros aplicados."
      />
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header com contador e botões de exportação */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {contas.length} conta{contas.length !== 1 ? 's' : ''} encontrada{contas.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportarContasReceberPDF(contas)}
            className="transition-all duration-200 hover:scale-105"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportarContasReceberExcel(contas)}
            className="transition-all duration-200 hover:scale-105"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((conta) => (
              <TableRow key={conta.id} className="h-12 transition-colors duration-200">
                <TableCell className="py-2.5">
                  {format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2">
                    {conta.descricao}
                    {conta.recorrencia !== 'unico' && (
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                    )}
                    {conta.anexos.length > 0 && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="capitalize py-2.5">{conta.tipo}</TableCell>
                <TableCell className="py-2.5">{conta.cliente || '-'}</TableCell>
                <TableCell className="text-right py-2.5">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(conta.valor))}
                </TableCell>
                <TableCell className="py-2.5">{getStatusBadge(conta.status)}</TableCell>
                <TableCell className="text-right py-2.5">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDetalhes(conta)}
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {conta.status === 'pendente' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarcarRecebido(conta)}
                        aria-label="Marcar como recebido"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditar(conta)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onExcluir(conta.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
