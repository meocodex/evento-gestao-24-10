import { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ContaPagar, ContaReceber } from '@/types/financeiro';

interface RelatorioFinanceiroDialogProps {
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
}

type FormatoExportacao = 'pdf' | 'excel' | 'csv';
type TipoRelatorio = 'resumo' | 'detalhado' | 'dre' | 'inadimplencia';

const periodos = [
  { value: 'mes_atual', label: 'Mês Atual' },
  { value: 'mes_anterior', label: 'Mês Anterior' },
  { value: 'trimestre', label: 'Último Trimestre' },
  { value: 'semestre', label: 'Último Semestre' },
  { value: 'ano', label: 'Este Ano' },
];

export function RelatorioFinanceiroDialog({ contasPagar, contasReceber }: RelatorioFinanceiroDialogProps) {
  const [open, setOpen] = useState(false);
  const [formato, setFormato] = useState<FormatoExportacao>('pdf');
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('resumo');
  const [periodo, setPeriodo] = useState('mes_atual');
  const [incluirGraficos, setIncluirGraficos] = useState(true);
  const [loading, setLoading] = useState(false);

  const gerarRelatorio = async () => {
    setLoading(true);

    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 1500));

      const hoje = new Date();
      let dataInicio: Date;
      let dataFim = endOfMonth(hoje);

      switch (periodo) {
        case 'mes_anterior':
          dataInicio = startOfMonth(subMonths(hoje, 1));
          dataFim = endOfMonth(subMonths(hoje, 1));
          break;
        case 'trimestre':
          dataInicio = startOfMonth(subMonths(hoje, 2));
          break;
        case 'semestre':
          dataInicio = startOfMonth(subMonths(hoje, 5));
          break;
        case 'ano':
          dataInicio = new Date(hoje.getFullYear(), 0, 1);
          break;
        default:
          dataInicio = startOfMonth(hoje);
      }

      const contasPagarFiltradas = contasPagar.filter(c => {
        const data = new Date(c.data_vencimento);
        return data >= dataInicio && data <= dataFim;
      });

      const contasReceberFiltradas = contasReceber.filter(c => {
        const data = new Date(c.data_vencimento);
        return data >= dataInicio && data <= dataFim;
      });

      if (formato === 'csv' || formato === 'excel') {
        // Gerar CSV
        const linhas: string[] = [];
        linhas.push('Tipo,Descrição,Valor,Vencimento,Status,Categoria/Tipo');

        contasPagarFiltradas.forEach(c => {
          linhas.push(`Pagar,"${c.descricao}",${c.valor},${c.data_vencimento},${c.status},${c.categoria}`);
        });

        contasReceberFiltradas.forEach(c => {
          linhas.push(`Receber,"${c.descricao}",${c.valor},${c.data_vencimento},${c.status},${c.tipo}`);
        });

        const csv = linhas.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Relatório exportado com sucesso!');
      } else {
        // Para PDF, usar jsPDF
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const periodoLabel = periodos.find(p => p.value === periodo)?.label || '';

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 14, 22);
        doc.setFontSize(11);
        doc.text(`Período: ${periodoLabel}`, 14, 30);
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 36);

        // Resumo
        const totalReceitas = contasReceberFiltradas.reduce((sum, c) => sum + Number(c.valor), 0);
        const totalDespesas = contasPagarFiltradas.reduce((sum, c) => sum + Number(c.valor), 0);
        const saldo = totalReceitas - totalDespesas;

        doc.setFontSize(12);
        doc.text('Resumo', 14, 48);

        const formatCurrency = (value: number) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

        autoTable(doc, {
          startY: 52,
          head: [['Descrição', 'Valor']],
          body: [
            ['Total de Receitas', formatCurrency(totalReceitas)],
            ['Total de Despesas', formatCurrency(totalDespesas)],
            ['Saldo', formatCurrency(saldo)],
          ],
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });

        // Tabela de Contas a Pagar
        if (contasPagarFiltradas.length > 0) {
          const finalY = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
          doc.setFontSize(12);
          doc.text('Contas a Pagar', 14, finalY + 10);

          autoTable(doc, {
            startY: finalY + 14,
            head: [['Descrição', 'Categoria', 'Vencimento', 'Status', 'Valor']],
            body: contasPagarFiltradas.slice(0, 20).map(c => [
              c.descricao.substring(0, 30),
              c.categoria,
              format(new Date(c.data_vencimento), 'dd/MM/yyyy'),
              c.status,
              formatCurrency(Number(c.valor)),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] },
          });
        }

        // Tabela de Contas a Receber
        if (contasReceberFiltradas.length > 0) {
          const finalY2 = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
          doc.setFontSize(12);
          doc.text('Contas a Receber', 14, finalY2 + 10);

          autoTable(doc, {
            startY: finalY2 + 14,
            head: [['Descrição', 'Tipo', 'Vencimento', 'Status', 'Valor']],
            body: contasReceberFiltradas.slice(0, 20).map(c => [
              c.descricao.substring(0, 30),
              c.tipo,
              format(new Date(c.data_vencimento), 'dd/MM/yyyy'),
              c.status,
              formatCurrency(Number(c.valor)),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
          });
        }

        doc.save(`relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        toast.success('Relatório PDF gerado com sucesso!');
      }

      setOpen(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
          <DialogDescription>
            Configure as opções do relatório e exporte nos formatos disponíveis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Relatório */}
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <RadioGroup value={tipoRelatorio} onValueChange={(v) => setTipoRelatorio(v as TipoRelatorio)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="resumo" id="resumo" />
                <Label htmlFor="resumo" className="font-normal">Resumo Mensal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detalhado" id="detalhado" />
                <Label htmlFor="detalhado" className="font-normal">Relatório Detalhado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dre" id="dre" />
                <Label htmlFor="dre" className="font-normal">DRE Simplificado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inadimplencia" id="inadimplencia" />
                <Label htmlFor="inadimplencia" className="font-normal">Relatório de Inadimplência</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <div className="flex gap-2">
              <Button
                variant={formato === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormato('pdf')}
                className="flex-1 gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant={formato === 'excel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormato('excel')}
                className="flex-1 gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant={formato === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormato('csv')}
                className="flex-1 gap-2"
              >
                <FileDown className="h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>

          {/* Opções Adicionais */}
          {formato === 'pdf' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="graficos"
                checked={incluirGraficos}
                onCheckedChange={(checked) => setIncluirGraficos(checked as boolean)}
              />
              <Label htmlFor="graficos" className="font-normal">Incluir gráficos</Label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={gerarRelatorio} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
