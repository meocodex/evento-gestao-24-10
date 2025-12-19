import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Pencil, Trash2, CheckCircle, Repeat, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContaPagar, StatusBadgeConfig } from '@/types/financeiro';

interface TabelaContasPagarProps {
  contas: ContaPagar[];
  onDetalhes: (conta: ContaPagar) => void;
  onEditar: (conta: ContaPagar) => void;
  onMarcarPago: (conta: ContaPagar) => void;
  onExcluir: (id: string) => void;
}

export function TabelaContasPagar({ contas, onDetalhes, onEditar, onMarcarPago, onExcluir }: TabelaContasPagarProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, StatusBadgeConfig> = {
      pendente: { variant: 'outline', label: 'Pendente' },
      pago: { variant: 'default', label: 'Pago' },
      vencido: { variant: 'destructive', label: 'Vencido' },
      cancelado: { variant: 'secondary', label: 'Cancelado' },
    };
    const { variant, label } = variants[status] || variants.pendente;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-3">

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((conta) => (
              <TableRow key={conta.id} className="h-12">
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
                <TableCell className="py-2.5">{conta.categoria}</TableCell>
                <TableCell className="py-2.5">{conta.fornecedor || '-'}</TableCell>
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
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {conta.status === 'pendente' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarcarPago(conta)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditar(conta)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onExcluir(conta.id)}
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
