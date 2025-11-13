import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Evento, Despesa, Receita } from '@/types/eventos';
import { FileDown, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RelatorioFechamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento;
  receitasSelecionadas: string[];
  despesasSelecionadas: string[];
}

export function RelatorioFechamentoDialog({ 
  open, 
  onOpenChange, 
  evento, 
  receitasSelecionadas,
  despesasSelecionadas 
}: RelatorioFechamentoDialogProps) {
  const { toast } = useToast();

  // Buscar configuração de papel timbrado
  const { data: config, isLoading } = useQuery({
    queryKey: ['configuracao-fechamento'],
    queryFn: async () => {
      const { data } = await supabase
        .from('configuracoes_fechamento')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: open,
  });

  const receitasFiltradas = evento.financeiro.receitas.filter(r => 
    receitasSelecionadas.includes(r.id)
  );

  const despesasFiltradas = evento.financeiro.despesas.filter(d => 
    despesasSelecionadas.includes(d.id)
  );

  const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0);
  const saldoFinal = totalReceitas - totalDespesas;

  const handleGerarPDF = async () => {
    const { jsPDF } = require('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Adicionar papel timbrado como background (se configurado)
    if (config?.papel_timbrado) {
      try {
        doc.addImage(config.papel_timbrado, 'JPEG', 0, 0, pageWidth, pageHeight);
      } catch (error) {
        console.error('Erro ao adicionar papel timbrado:', error);
      }
    }

    // Definir margens (considerar header/footer do timbrado)
    const marginTop = config?.papel_timbrado ? 60 : 20;
    let currentY = marginTop;
    
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('RELATÓRIO DE FECHAMENTO DO EVENTO', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Dados do Evento
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DADOS DO EVENTO', 14, currentY);
    currentY += 5;
    
    const dadosEvento = [
      ['Nome do Evento:', evento.nome],
      ['Data:', `${evento.dataInicio} a ${evento.dataFim}`],
      ['Local:', `${evento.cidade}, ${evento.estado}`],
      ['Status:', evento.status.toUpperCase()]
    ];
    
    (doc as any).autoTable({
      startY: currentY,
      body: dadosEvento,
      theme: 'plain',
      styles: { fontSize: 9, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 'auto' }
      }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
    
    // Dados do Cliente
    doc.setFont(undefined, 'bold');
    doc.text('DADOS DO CLIENTE', 14, currentY);
    currentY += 5;

    const dadosCliente = [
      ['Nome:', evento.cliente.nome],
      ['Documento:', evento.cliente.documento || '-'],
      ['Telefone:', evento.cliente.telefone],
      ['Email:', evento.cliente.email]
    ];

    (doc as any).autoTable({
      startY: currentY,
      body: dadosCliente,
      theme: 'plain',
      styles: { fontSize: 9, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 'auto' }
      }
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Produtor Responsável
    doc.setFont(undefined, 'bold');
    doc.text('PRODUTOR RESPONSÁVEL', 14, currentY);
    currentY += 5;

    const dadosProdutor = [
      ['Nome:', evento.comercial.nome],
      ['Email:', evento.comercial.email]
    ];

    (doc as any).autoTable({
      startY: currentY,
      body: dadosProdutor,
      theme: 'plain',
      styles: { fontSize: 9, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 'auto' }
      }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Tabela de Receitas (se houver)
    if (receitasFiltradas.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('RECEITAS DO EVENTO', 14, currentY);
      currentY += 5;

      const receitasData = receitasFiltradas.map(r => [
        r.tipo.toUpperCase(),
        r.descricao,
        r.quantidade.toString(),
        `R$ ${r.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      (doc as any).autoTable({
        startY: currentY,
        head: [['Tipo', 'Descrição', 'Qtd', 'Valor Un.', 'Total']],
        body: receitasData,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, textColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 70 },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
      doc.setFont(undefined, 'bold');
      doc.setTextColor(22, 163, 74); // verde
      doc.text(
        `SUBTOTAL RECEITAS: R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        pageWidth - 14,
        currentY,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0); // reset para preto
      currentY += 15;
    }

    // Tabela de Despesas (se houver)
    if (despesasFiltradas.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('DESPESAS DO EVENTO', 14, currentY);
      currentY += 5;

      const despesasData = despesasFiltradas.map(d => [
        d.categoria.toUpperCase(),
        d.descricao,
        d.quantidade.toString(),
        `R$ ${d.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      (doc as any).autoTable({
        startY: currentY,
        head: [['Categoria', 'Descrição', 'Qtd', 'Valor Un.', 'Total']],
        body: despesasData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, textColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 70 },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
      doc.setFont(undefined, 'bold');
      doc.setTextColor(220, 38, 38); // vermelho
      doc.text(
        `SUBTOTAL DESPESAS: R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        pageWidth - 14,
        currentY,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0); // reset para preto
      currentY += 15;
    }

    // Resumo Financeiro
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('RESUMO FINANCEIRO', 14, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.text(`Total Receitas:`, 14, currentY);
    doc.setTextColor(22, 163, 74);
    doc.text(`R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 14, currentY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    currentY += 7;

    doc.text(`Total Despesas:`, 14, currentY);
    doc.setTextColor(220, 38, 38);
    doc.text(`(-) R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 14, currentY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    currentY += 7;

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 7;

    // Saldo final
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    if (saldoFinal >= 0) {
      doc.setTextColor(22, 163, 74); // verde
    } else {
      doc.setTextColor(220, 38, 38); // vermelho
    }
    doc.text(`SALDO FINAL:`, 14, currentY);
    doc.text(`R$ ${saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 14, currentY, { align: 'right' });

    // Salvar PDF
    const dataAtual = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`Fechamento_${evento.nome.replace(/\s+/g, '_')}_${dataAtual}.pdf`);
    
    toast({
      title: 'PDF gerado!',
      description: 'O relatório de fechamento foi baixado com sucesso.',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Relatório de Fechamento</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Evento: {evento.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {evento.dataInicio} a {evento.dataFim} | {evento.cidade}, {evento.estado}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Receitas selecionadas:</span>
                <span className="font-semibold">{receitasFiltradas.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Despesas selecionadas:</span>
                <span className="font-semibold">{despesasFiltradas.length}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-green-600">
                <span>Total Receitas:</span>
                <span className="font-bold">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Total Despesas:</span>
                <span className="font-bold">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Saldo Final:</span>
                <span className={`font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {!config?.papel_timbrado && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  ⚠️ Nenhum papel timbrado configurado. O PDF será gerado sem papel timbrado.
                  Configure em <span className="font-semibold">Configurações → Fechamento</span>.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleGerarPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
