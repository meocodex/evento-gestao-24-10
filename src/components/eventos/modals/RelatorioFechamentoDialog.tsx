import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Evento, AutoTableDocument, EmpresaConfig } from '@/types/eventos';
import { FileDown, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfiguracoes } from '@/hooks/configuracoes/useConfiguracoes';
import papelTimbradoImg from '@/assets/papel-timbrado-novo.jpg';

interface RelatorioFechamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento;
  receitasSelecionadas: string[];
  despesasSelecionadas: string[];
}

// Helper para carregar imagem e converter para base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = url;
  });
};

export function RelatorioFechamentoDialog({ 
  open, 
  onOpenChange, 
  evento, 
  receitasSelecionadas,
  despesasSelecionadas 
}: RelatorioFechamentoDialogProps) {
  const { toast } = useToast();
  const { configuracoes } = useConfiguracoes();

  // Carregar papel timbrado do asset como base64
  const { data: papelTimbradoBase64, isLoading } = useQuery({
    queryKey: ['papel-timbrado-base64'],
    queryFn: () => loadImageAsBase64(papelTimbradoImg),
    enabled: open,
    staleTime: Infinity, // Cache permanente
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

  // Cores Ticket Up - Palette RGB
  const CORES = {
    navy: [30, 36, 51] as [number, number, number],        // #1E2433
    dourado: [139, 126, 65] as [number, number, number],   // #8B7E41
    douradoClaro: [166, 149, 72] as [number, number, number], // #A69548
    branco: [255, 255, 255] as [number, number, number],
    cinzaClaro: [248, 248, 248] as [number, number, number],
    cinzaMedio: [100, 100, 100] as [number, number, number],
    preto: [40, 40, 40] as [number, number, number]
  };

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

      // Margens para respeitar o papel timbrado Ticket Up
      const margens = papelTimbradoBase64 
        ? { top: 45, bottom: 35, left: 20, right: 20 }
        : { top: 20, bottom: 20, left: 14, right: 14 };
      
      const contentWidth = pageWidth - margens.left - margens.right;
      const maxY = pageHeight - margens.bottom;

      // Função para adicionar papel timbrado
      let timbradoValido = true;
      const adicionarTimbrado = () => {
        if (papelTimbradoBase64 && timbradoValido) {
          try {
            doc.addImage(papelTimbradoBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
          } catch (error) {
            console.error('[PDF] Erro ao adicionar papel timbrado:', error);
            timbradoValido = false;
          }
        }
      };

      // Interceptar addPage para adicionar timbrado ANTES do conteúdo
      const originalAddPage = doc.addPage.bind(doc);
      doc.addPage = function(this: jsPDF, ...args: Parameters<typeof originalAddPage>) {
        const result = originalAddPage.apply(this, args);
        adicionarTimbrado();
        return result;
      } as typeof doc.addPage;

      // Função para verificar quebra de página
      const verificarQuebraPagina = (yAtual: number, espacoNecessario: number): number => {
        if (yAtual + espacoNecessario > maxY) {
          doc.addPage();
          return margens.top;
        }
        return yAtual;
      };

      // Função para desenhar título de seção com faixa navy (compacta)
      const desenharTituloSecao = (titulo: string, y: number): number => {
        const alturaFaixa = 6;
        doc.setFillColor(...CORES.navy);
        doc.rect(margens.left, y - 4, contentWidth, alturaFaixa, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...CORES.branco);
        doc.text(titulo, margens.left + 3, y);
        doc.setTextColor(...CORES.preto);
        return y + alturaFaixa + 2;
      };

      // Função para desenhar linha separadora dourada
      const desenharSeparadorDourado = (y: number): number => {
        doc.setDrawColor(...CORES.dourado);
        doc.setLineWidth(0.5);
        doc.line(margens.left, y, pageWidth - margens.right, y);
        return y + 3;
      };

      // Adicionar papel timbrado na primeira página
      adicionarTimbrado();

      let currentY = margens.top;
      
      // ===== TÍTULO PRINCIPAL =====
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text('RELATÓRIO DE FECHAMENTO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 4;
      
      // Linha decorativa dourada
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(0.8);
      const tituloWidth = 70;
      doc.line((pageWidth - tituloWidth) / 2, currentY, (pageWidth + tituloWidth) / 2, currentY);
      currentY += 8;

      // ===== DADOS DO EVENTO (layout 2 colunas) =====
      currentY = verificarQuebraPagina(currentY, 25);
      currentY = desenharTituloSecao('DADOS DO EVENTO', currentY);
      
      const colWidth = (contentWidth - 10) / 2;
      const dadosEvento2Col = [
        ['Nome:', evento.nome, 'Local:', `${evento.cidade}, ${evento.estado}`],
        ['Data:', `${evento.dataInicio} a ${evento.dataFim}`, 'Status:', evento.status.toUpperCase()]
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { left: margens.left, right: margens.right },
        tableWidth: contentWidth,
        body: dadosEvento2Col,
        theme: 'plain',
        styles: { fontSize: 8, textColor: CORES.preto, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 22, textColor: CORES.navy },
          1: { cellWidth: colWidth - 22 },
          2: { fontStyle: 'bold', cellWidth: 22, textColor: CORES.navy },
          3: { cellWidth: colWidth - 22 }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 4;
      
      // ===== DADOS DO CLIENTE (layout 2 colunas) =====
      currentY = verificarQuebraPagina(currentY, 25);
      currentY = desenharTituloSecao('DADOS DO CLIENTE', currentY);

      const dadosCliente2Col = [
        ['Nome:', evento.cliente?.nome || '-', 'Documento:', evento.cliente?.documento || '-'],
        ['Telefone:', evento.cliente?.telefone || '-', 'Email:', evento.cliente?.email || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { left: margens.left, right: margens.right },
        tableWidth: contentWidth,
        body: dadosCliente2Col,
        theme: 'plain',
        styles: { fontSize: 8, textColor: CORES.preto, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 22, textColor: CORES.navy },
          1: { cellWidth: colWidth - 22 },
          2: { fontStyle: 'bold', cellWidth: 22, textColor: CORES.navy },
          3: { cellWidth: colWidth - 22 }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 4;
      
      // ===== DADOS DA EMPRESA (layout 2 colunas) =====
      currentY = verificarQuebraPagina(currentY, 25);
      currentY = desenharTituloSecao('DADOS DA EMPRESA', currentY);

      const empresaConfig = configuracoes?.empresa;
      
      // Função para formatar endereço (compacto)
      const formatarEnderecoEmpresa = (endereco: unknown) => {
        if (!endereco || typeof endereco !== 'object') return '-';
        const end = endereco as Record<string, string>;
        const { logradouro = '', numero = '', bairro = '', cidade = '', estado = '' } = end;
        const partes = [
          logradouro && numero ? `${logradouro}, ${numero}` : logradouro || numero,
          bairro,
          cidade && estado ? `${cidade}/${estado}` : cidade || estado
        ].filter(Boolean);
        return partes.length > 0 ? partes.join(' - ') : '-';
      };

      const empresa = empresaConfig as EmpresaConfig | undefined;
      const dadosEmpresa2Col = [
        ['Razão Social:', empresa?.nome || empresa?.razaoSocial || '-', 'CNPJ:', empresaConfig?.cnpj || '-'],
        ['Endereço:', formatarEnderecoEmpresa(empresaConfig?.endereco), 'Telefone:', empresaConfig?.telefone || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { left: margens.left, right: margens.right },
        tableWidth: contentWidth,
        body: dadosEmpresa2Col,
        theme: 'plain',
        styles: { fontSize: 8, textColor: CORES.preto, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 28, textColor: CORES.navy },
          1: { cellWidth: colWidth - 28 },
          2: { fontStyle: 'bold', cellWidth: 22, textColor: CORES.navy },
          3: { cellWidth: colWidth - 22 }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 5;

      // Separador dourado antes das tabelas financeiras
      currentY = desenharSeparadorDourado(currentY);
      currentY += 3;

      // ===== TABELA DE RECEITAS =====
      if (receitasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 25);
        currentY = desenharTituloSecao('RECEITAS', currentY);
        
        const receitasData = receitasFiltradas.map(receita => [
          receita.descricao,
          receita.quantidade?.toString() || '1',
          `R$ ${receita.valorUnitario?.toFixed(2) || receita.valor.toFixed(2)}`,
          `R$ ${receita.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          margin: { left: margens.left, right: margens.right },
          tableWidth: contentWidth,
          head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
          body: receitasData,
          theme: 'grid',
          headStyles: { 
            fillColor: CORES.navy,
            textColor: CORES.branco,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1.5
          },
          styles: { 
            fontSize: 8,
            cellPadding: 1.5,
            textColor: CORES.preto
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 12, halign: 'center' },
            2: { cellWidth: 28, halign: 'right' },
            3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
          },
          showHead: 'everyPage',
          tableLineColor: CORES.dourado,
          tableLineWidth: 0.1
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 4;
      }

      // ===== TABELA DE DESPESAS =====
      if (despesasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 25);
        currentY = desenharTituloSecao('DESPESAS', currentY);
        
        const despesasData = despesasFiltradas.map(despesa => [
          despesa.descricao,
          despesa.categoria || '-',
          `R$ ${despesa.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          margin: { left: margens.left, right: margens.right },
          tableWidth: contentWidth,
          head: [['Descrição', 'Categoria', 'Valor']],
          body: despesasData,
          theme: 'grid',
          headStyles: { 
            fillColor: CORES.dourado,
            textColor: CORES.branco,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1.5
          },
          styles: { 
            fontSize: 8,
            cellPadding: 1.5,
            textColor: CORES.preto
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 32, halign: 'center' },
            2: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
          },
          showHead: 'everyPage',
          tableLineColor: CORES.navy,
          tableLineWidth: 0.1
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 4;
      }

      // ===== RESUMO FINANCEIRO =====
      let yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 6;
      yPos = verificarQuebraPagina(yPos, 40);

      // Box do resumo com borda dourada (sem fundo)
      const boxHeight = 38;
      const boxY = yPos - 2;
      
      // Apenas borda do box (fundo transparente)
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(0.8);
      doc.roundedRect(margens.left, boxY, contentWidth, boxHeight, 2, 2, 'S');
      
      // Título do resumo
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text('RESUMO FINANCEIRO', pageWidth / 2, yPos, { align: 'center' });
      
      // Linha decorativa
      yPos += 2;
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(0.3);
      doc.line(margens.left + 25, yPos, pageWidth - margens.right - 25, yPos);
      
      yPos += 6;
      
      // Total Receitas
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text('Total de Receitas:', margens.left + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text(`R$ ${totalReceitas.toFixed(2)}`, pageWidth - margens.right - 8, yPos, { align: 'right' });
      
      yPos += 5;
      
      // Total Despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text('Total de Despesas:', margens.left + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.cinzaMedio);
      doc.text(`R$ ${totalDespesas.toFixed(2)}`, pageWidth - margens.right - 8, yPos, { align: 'right' });
      
      yPos += 6;
      
      // Linha separadora
      doc.setDrawColor(...CORES.navy);
      doc.setLineWidth(0.4);
      doc.line(margens.left + 8, yPos - 2, pageWidth - margens.right - 8, yPos - 2);
      
      // Saldo Final (destaque)
      const saldoLabel = saldoFinal >= 0 ? 'SALDO A RECEBER:' : 'SALDO A PAGAR:';
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text(saldoLabel, margens.left + 8, yPos + 3);
      
      // Cor do saldo: Navy para positivo, Dourado para negativo
      if (saldoFinal >= 0) {
        doc.setTextColor(...CORES.navy);
      } else {
        doc.setTextColor(...CORES.dourado);
      }
      doc.text(`R$ ${Math.abs(saldoFinal).toFixed(2)}`, pageWidth - margens.right - 8, yPos + 3, { align: 'right' });

      // Nota explicativa
      const notaY = boxY + boxHeight + 5;
      const notaExplicativa = saldoFinal >= 0 
        ? 'Valor que a empresa deve repassar ao cliente'
        : 'Valor que o cliente deve pagar à empresa';
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...CORES.cinzaMedio);
      doc.text(notaExplicativa, pageWidth / 2, notaY, { align: 'center' });

      // ===== RODAPÉ EM TODAS AS PÁGINAS =====
      const dataGeracao = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const desenharRodape = (paginaAtual: number, totalPaginas: number) => {
        // Posição Y diferente dependendo se tem papel timbrado
        // Com papel timbrado: subir para ficar acima da área dourada do timbrado
        const rodapeY = papelTimbradoBase64 ? pageHeight - 18 : pageHeight - 12;
        
        // Linha separadora dourada apenas SEM papel timbrado
        // (o papel timbrado já tem design próprio no rodapé)
        if (!papelTimbradoBase64) {
          doc.setDrawColor(...CORES.dourado);
          doc.setLineWidth(0.3);
          doc.line(margens.left, rodapeY - 3, pageWidth - margens.right, rodapeY - 3);
        }
        
        // Data de geração (esquerda)
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...CORES.cinzaMedio);
        doc.text(`Gerado em: ${dataGeracao}`, margens.left, rodapeY);
        
        // Número da página (direita)
        doc.text(`Página ${paginaAtual} de ${totalPaginas}`, pageWidth - margens.right, rodapeY, { align: 'right' });
      };

      // Aplicar rodapé em todas as páginas
      const totalPaginas = (doc as unknown as { internal: { pages: unknown[] } }).internal.pages.length - 1;
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        desenharRodape(i, totalPaginas);
      }

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

          {papelTimbradoBase64 && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Papel timbrado da Ticket Up será aplicado no relatório.
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
