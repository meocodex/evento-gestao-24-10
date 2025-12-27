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

      // Função para desenhar título de seção com faixa navy
      const desenharTituloSecao = (titulo: string, y: number): number => {
        const alturaFaixa = 8;
        doc.setFillColor(...CORES.navy);
        doc.rect(margens.left, y - 5, contentWidth, alturaFaixa, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...CORES.branco);
        doc.text(titulo, margens.left + 4, y);
        doc.setTextColor(...CORES.preto);
        return y + alturaFaixa + 3;
      };

      // Função para desenhar linha separadora dourada
      const desenharSeparadorDourado = (y: number): number => {
        doc.setDrawColor(...CORES.dourado);
        doc.setLineWidth(0.5);
        doc.line(margens.left, y, pageWidth - margens.right, y);
        return y + 5;
      };

      // Adicionar papel timbrado na primeira página
      adicionarTimbrado();

      let currentY = margens.top;
      
      // ===== TÍTULO PRINCIPAL =====
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text('RELATÓRIO DE FECHAMENTO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
      
      // Linha decorativa dourada
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(1);
      const tituloWidth = 80;
      doc.line((pageWidth - tituloWidth) / 2, currentY, (pageWidth + tituloWidth) / 2, currentY);
      currentY += 12;

      // ===== DADOS DO EVENTO =====
      currentY = verificarQuebraPagina(currentY, 45);
      currentY = desenharTituloSecao('DADOS DO EVENTO', currentY);
      
      const dadosEvento = [
        ['Nome:', evento.nome],
        ['Data:', `${evento.dataInicio} a ${evento.dataFim}`],
        ['Local:', `${evento.cidade}, ${evento.estado}`],
        ['Status:', evento.status.toUpperCase()]
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
        tableWidth: contentWidth,
        body: dadosEvento,
        theme: 'plain',
        styles: { fontSize: 9, textColor: CORES.preto, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 35, textColor: CORES.navy },
          1: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: CORES.cinzaClaro }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 8;
      
      // ===== DADOS DO CLIENTE =====
      currentY = verificarQuebraPagina(currentY, 45);
      currentY = desenharTituloSecao('DADOS DO CLIENTE', currentY);

      const dadosCliente = [
        ['Nome:', evento.cliente?.nome || '-'],
        ['Documento:', evento.cliente?.documento || '-'],
        ['Telefone:', evento.cliente?.telefone || '-'],
        ['Email:', evento.cliente?.email || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
        tableWidth: contentWidth,
        body: dadosCliente,
        theme: 'plain',
        styles: { fontSize: 9, textColor: CORES.preto, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 35, textColor: CORES.navy },
          1: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: CORES.cinzaClaro }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 8;
      
      // ===== DADOS DA EMPRESA =====
      currentY = verificarQuebraPagina(currentY, 45);
      currentY = desenharTituloSecao('DADOS DA EMPRESA', currentY);

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
        ['Razão Social:', empresa?.nome || empresa?.razaoSocial || '-'],
        ['CNPJ:', empresaConfig?.cnpj || '-'],
        ['Endereço:', formatarEnderecoEmpresa(empresaConfig?.endereco)],
        ['Telefone:', empresaConfig?.telefone || '-']
      ];
      
      autoTable(doc, {
        startY: currentY,
        margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
        tableWidth: contentWidth,
        body: dadosEmpresa,
        theme: 'plain',
        styles: { fontSize: 9, textColor: CORES.preto, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 35, textColor: CORES.navy },
          1: { cellWidth: 'auto' }
        },
        alternateRowStyles: { fillColor: CORES.cinzaClaro }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;

      // Separador dourado antes das tabelas financeiras
      currentY = desenharSeparadorDourado(currentY);
      currentY += 5;

      // ===== TABELA DE RECEITAS =====
      if (receitasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 35);
        currentY = desenharTituloSecao('RECEITAS', currentY);
        
        const receitasData = receitasFiltradas.map(receita => [
          receita.descricao,
          receita.quantidade?.toString() || '1',
          `R$ ${receita.valorUnitario?.toFixed(2) || receita.valor.toFixed(2)}`,
          `R$ ${receita.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
          tableWidth: contentWidth,
          head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
          body: receitasData,
          theme: 'grid',
          headStyles: { 
            fillColor: CORES.navy,
            textColor: CORES.branco,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            textColor: CORES.preto
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
          },
          alternateRowStyles: { fillColor: CORES.cinzaClaro },
          showHead: 'everyPage',
          tableLineColor: CORES.dourado,
          tableLineWidth: 0.1
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 8;
      }

      // ===== TABELA DE DESPESAS =====
      if (despesasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 35);
        currentY = desenharTituloSecao('DESPESAS', currentY);
        
        const despesasData = despesasFiltradas.map(despesa => [
          despesa.descricao,
          despesa.categoria || '-',
          `R$ ${despesa.valor.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: currentY,
          margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
          tableWidth: contentWidth,
          head: [['Descrição', 'Categoria', 'Valor']],
          body: despesasData,
          theme: 'grid',
          headStyles: { 
            fillColor: CORES.dourado,
            textColor: CORES.branco,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            textColor: CORES.preto
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 35, halign: 'center' },
            2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
          },
          alternateRowStyles: { fillColor: CORES.cinzaClaro },
          showHead: 'everyPage',
          tableLineColor: CORES.navy,
          tableLineWidth: 0.1
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 8;
      }

      // ===== RESUMO FINANCEIRO =====
      let yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      yPos = verificarQuebraPagina(yPos, 55);

      // Box do resumo com borda dourada
      const boxHeight = 45;
      const boxY = yPos - 2;
      
      // Fundo e borda do box
      doc.setFillColor(...CORES.cinzaClaro);
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(1);
      doc.roundedRect(margens.left, boxY, contentWidth, boxHeight, 3, 3, 'FD');
      
      // Título do resumo
      yPos += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text('RESUMO FINANCEIRO', pageWidth / 2, yPos, { align: 'center' });
      
      // Linha decorativa
      yPos += 3;
      doc.setDrawColor(...CORES.dourado);
      doc.setLineWidth(0.3);
      doc.line(margens.left + 20, yPos, pageWidth - margens.right - 20, yPos);
      
      yPos += 8;
      
      // Total Receitas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text('Total de Receitas:', margens.left + 10, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text(`R$ ${totalReceitas.toFixed(2)}`, pageWidth - margens.right - 10, yPos, { align: 'right' });
      
      yPos += 6;
      
      // Total Despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text('Total de Despesas:', margens.left + 10, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.cinzaMedio);
      doc.text(`R$ ${totalDespesas.toFixed(2)}`, pageWidth - margens.right - 10, yPos, { align: 'right' });
      
      yPos += 8;
      
      // Linha separadora
      doc.setDrawColor(...CORES.navy);
      doc.setLineWidth(0.5);
      doc.line(margens.left + 10, yPos - 2, pageWidth - margens.right - 10, yPos - 2);
      
      // Saldo Final (destaque)
      const saldoLabel = saldoFinal >= 0 ? 'SALDO A RECEBER:' : 'SALDO A PAGAR:';
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.navy);
      doc.text(saldoLabel, margens.left + 10, yPos + 4);
      
      // Cor do saldo: Navy para positivo, Dourado para negativo
      if (saldoFinal >= 0) {
        doc.setTextColor(...CORES.navy);
      } else {
        doc.setTextColor(...CORES.dourado);
      }
      doc.text(`R$ ${Math.abs(saldoFinal).toFixed(2)}`, pageWidth - margens.right - 10, yPos + 4, { align: 'right' });

      // Nota explicativa
      const notaY = boxY + boxHeight + 8;
      const notaExplicativa = saldoFinal >= 0 
        ? 'Valor que a empresa deve repassar ao cliente'
        : 'Valor que o cliente deve pagar à empresa';
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...CORES.cinzaMedio);
      doc.text(notaExplicativa, pageWidth / 2, notaY, { align: 'center' });

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
