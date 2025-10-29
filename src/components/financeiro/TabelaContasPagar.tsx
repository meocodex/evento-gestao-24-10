import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Pencil, Trash2, CheckCircle, Repeat, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContaPagar } from '@/types/financeiro';

interface TabelaContasPagarProps {
  contas: ContaPagar[];
  onDetalhes: (conta: ContaPagar) => void;
  onEditar: (conta: ContaPagar) => void;
  onMarcarPago: (conta: ContaPagar) => void;
  onExcluir: (id: string) => void;
}

export function TabelaContasPagar({ contas, onDetalhes, onEditar, onMarcarPago, onExcluir }: TabelaContasPagarProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  const contasFiltradas = contas.filter(conta => {
    const matchStatus = filtroStatus === 'todos' || conta.status === filtroStatus;
    const matchBusca = busca === '' || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      conta.fornecedor?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.categoria.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pendente: { variant: 'outline', label: 'Pendente' },
      pago: { variant: 'default', label: 'Pago' },
      vencido: { variant: 'destructive', label: 'Vencido' },
      cancelado: { variant: 'secondary', label: 'Cancelado' },
    };
    const { variant, label } = variants[status] || variants.pendente;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por descrição, fornecedor ou categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1"
        />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            {contasFiltradas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell>
                  {format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
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
                <TableCell>{conta.categoria}</TableCell>
                <TableCell>{conta.fornecedor || '-'}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(conta.valor))}
                </TableCell>
                <TableCell>{getStatusBadge(conta.status)}</TableCell>
                <TableCell className="text-right">
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
