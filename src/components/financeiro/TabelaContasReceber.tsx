import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Pencil, Trash2, CheckCircle, Repeat, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContaReceber, StatusBadgeConfig } from '@/types/financeiro';

interface TabelaContasReceberProps {
  contas: ContaReceber[];
  onDetalhes: (conta: ContaReceber) => void;
  onEditar: (conta: ContaReceber) => void;
  onMarcarRecebido: (conta: ContaReceber) => void;
  onExcluir: (id: string) => void;
}

export function TabelaContasReceber({ contas, onDetalhes, onEditar, onMarcarRecebido, onExcluir }: TabelaContasReceberProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  const contasFiltradas = contas.filter(conta => {
    const matchStatus = filtroStatus === 'todos' || conta.status === filtroStatus;
    const matchBusca = busca === '' || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      conta.cliente?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.tipo.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

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

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Input
          placeholder="Buscar por descrição, cliente ou tipo..."
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
            <SelectItem value="recebido">Recebido</SelectItem>
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
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contasFiltradas.map((conta) => (
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
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {conta.status === 'pendente' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarcarRecebido(conta)}
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
