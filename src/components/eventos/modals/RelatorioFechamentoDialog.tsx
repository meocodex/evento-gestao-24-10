import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Evento, AutoTableDocument, EmpresaConfig } from '@/types/eventos';
import { FileDown, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfiguracoes } from '@/hooks/configuracoes/useConfiguracoes';

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
  const { configuracoes } = useConfiguracoes();

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
    // Verificar se há itens selecionados
    if (receitasFiltradas.length === 0 && despesasFiltradas.length === 0) {
      toast({
        title: 'Nenhum item selecionado',
        description: 'Selecione ao menos uma receita ou despesa antes de gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Adicionar papel timbrado como background (se configurado)
      if (config?.papel_timbrado) {
        try {
          doc.addImage(config.papel_timbrado, 'JPEG', 0, 0, pageWidth, pageHeight);
        } catch (error) {
          toast({
            title: 'Aviso',
            description: 'Não foi possível adicionar o papel timbrado, continuando sem ele.',
          });
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
      
      autoTable(doc, {
        startY: currentY,
        body: dadosEvento,
        theme: 'plain',
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      
      // Dados do Cliente
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO CLIENTE', 14, currentY);
      currentY += 5;

      const dadosCliente = [
        ['Nome:', evento.cliente?.nome || '-'],
        ['Documento:', evento.cliente?.documento || '-'],
        ['Telefone:', evento.cliente?.telefone || '-'],
        ['Email:', evento.cliente?.email || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: dadosCliente,
        theme: 'plain',
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      
      // Dados da Empresa
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DA EMPRESA', 14, currentY);
      currentY += 5;

      const empresaConfig = configuracoes?.empresa;
      
      // Função para formatar endereço
      const formatarEnderecoEmpresa = (endereco: unknown) => {
        if (!endereco || typeof endereco !== 'object') return '-';
        const end = endereco as Record<string, string>;
        const { logradouro = '', numero = '', complemento = '', bairro = '', cidade = '', estado = '', cep = '' } = end;
        const partes = [
          logradouro && numero ? `${logradouro}, ${numero}` : logradouro || numero,
          complemento,
          bairro,
          cidade && estado ? `${cidade}/${estado}` : cidade || estado,
          cep ? `CEP ${cep}` : ''
        ].filter(Boolean);
        return partes.length > 0 ? partes.join(' - ') : '-';
      };

      const empresa = empresaConfig as EmpresaConfig | undefined;
      const dadosEmpresa = [
        ['Nome:', empresa?.nome || empresa?.razaoSocial || '-'],
        ['CNPJ:', empresaConfig?.cnpj || '-'],
        ['Endereço:', formatarEnderecoEmpresa(empresaConfig?.endereco)],
        ['Telefone:', empresaConfig?.telefone || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: dadosEmpresa,
        theme: 'plain',
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 15;

      // Tabela de Receitas
      if (receitasFiltradas.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('RECEITAS', 14, currentY);
        currentY += 7;
        
        const receitasData = receitasFiltradas.map(receita => [
          receita.descricao,
          receita.quantidade?.toString() || '1',
          `R$ ${receita.valorUnitario?.toFixed(2) || receita.valor.toFixed(2)}`,
          `R$ ${receita.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
          body: receitasData,
          theme: 'grid',
          headStyles: { 
            fillColor: [34, 197, 94], // green-500
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          }
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      }

      // Tabela de Despesas
      if (despesasFiltradas.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('DESPESAS', 14, currentY);
        currentY += 7;
        
        const despesasData = despesasFiltradas.map(despesa => [
          despesa.descricao,
          despesa.categoria || '-',
          `R$ ${despesa.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          head: [['Descrição', 'Categoria', 'Valor']],
          body: despesasData,
          theme: 'grid',
          headStyles: { 
            fillColor: [239, 68, 68], // red-500
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 45 },
            2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          }
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      }

      // Resumo Financeiro
      const yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('RESUMO FINANCEIRO', 14, yPos);

      const resumoData = [
        ['Total de Receitas:', `R$ ${totalReceitas.toFixed(2)}`],
        ['Total de Despesas:', `R$ ${totalDespesas.toFixed(2)}`],
        [saldoFinal >= 0 ? 'A RECEBER:' : 'A PAGAR:', `R$ ${Math.abs(saldoFinal).toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: yPos + 5,
        body: resumoData,
        theme: 'plain',
        styles: { 
          fontSize: 11,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60, halign: 'right' }
        },
        didParseCell: (data) => {
          if (data.row.index === 0 && data.column.index === 1) {
            data.cell.styles.textColor = [34, 197, 94]; // green
          }
          if (data.row.index === 1 && data.column.index === 1) {
            data.cell.styles.textColor = [239, 68, 68]; // red
          }
          if (data.row.index === 2) {
            data.cell.styles.fontSize = 13;
            data.cell.styles.textColor = saldoFinal >= 0 ? [34, 197, 94] : [239, 68, 68];
          }
        }
      });

      // Nota explicativa
      const finalY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 5;
      const notaExplicativa = saldoFinal >= 0 
        ? 'Valor que a empresa deve repassar ao cliente'
        : 'Valor que o cliente deve pagar à empresa';
      
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(notaExplicativa, 14, finalY);

      // Salvar PDF
      const dataAtual = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const nomeArquivo = `Fechamento_${evento.nome.replace(/\s+/g, '_')}_${dataAtual}.pdf`;
      doc.save(nomeArquivo);
      
      toast({
        title: 'PDF gerado com sucesso!',
        description: 'O relatório de fechamento foi baixado.',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao gerar PDF',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao gerar o relatório.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Relatório de Fechamento</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Relatório de Fechamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-semibold mb-3">Resumo do Evento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receitas selecionadas:</span>
                <span className="font-medium">{receitasFiltradas.length} itens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas selecionadas:</span>
                <span className="font-medium">{despesasFiltradas.length} itens</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Receitas:</span>
                <span className="font-semibold text-green-600">R$ {totalReceitas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Despesas:</span>
                <span className="font-semibold text-red-600">R$ {totalDespesas.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">
                  {saldoFinal >= 0 ? 'A RECEBER:' : 'A PAGAR:'}
                </span>
                <span className={`font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(saldoFinal).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {saldoFinal >= 0 
                  ? '💰 Valor que a empresa deve repassar ao cliente' 
                  : '⚠️ Valor que o cliente deve pagar à empresa'
                }
              </p>
            </div>
          </div>

          {!config?.papel_timbrado && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Nenhum papel timbrado configurado. O relatório será gerado sem marca d'água.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Configure um papel timbrado em Configurações → Fechamento.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleGerarPDF}
              className="bg-primary hover:bg-primary/90"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
