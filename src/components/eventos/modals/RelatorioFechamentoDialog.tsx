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
      // Header: ~35mm ocupado → margem top 45mm
      // Rodapé: ~25mm ocupado → margem bottom 35mm
      // Laterais: ~15mm diagonais → margem 20mm
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
            console.log('[PDF] Adicionando timbrado na página', doc.getNumberOfPages());
            doc.addImage(papelTimbradoBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
            console.log('[PDF] Timbrado adicionado com sucesso');
          } catch (error) {
            console.error('[PDF] Erro ao adicionar papel timbrado:', error);
            timbradoValido = false;
            toast({
              title: 'Erro ao adicionar papel timbrado',
              description: 'Não foi possível adicionar o papel timbrado ao PDF.',
              variant: 'destructive'
            });
          }
        }
      };

      // Interceptar addPage para adicionar timbrado ANTES do conteúdo
      const originalAddPage = doc.addPage.bind(doc);
      doc.addPage = function(this: jsPDF, ...args: Parameters<typeof originalAddPage>) {
        console.log('[PDF] Nova página criada');
        const result = originalAddPage.apply(this, args);
        adicionarTimbrado();
        return result;
      } as typeof doc.addPage;

      // Função para verificar quebra de página
      const verificarQuebraPagina = (yAtual: number, espacoNecessario: number): number => {
        if (yAtual + espacoNecessario > maxY) {
          doc.addPage(); // O timbrado será adicionado automaticamente pelo interceptor
          return margens.top;
        }
        return yAtual;
      };

      // Adicionar papel timbrado na primeira página
      adicionarTimbrado();

      let currentY = margens.top;
      
      // Título
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('RELATÓRIO DE FECHAMENTO DO EVENTO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;
      
      // Dados do Evento
      currentY = verificarQuebraPagina(currentY, 40);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO EVENTO', margens.left, currentY);
      currentY += 5;
      
      const dadosEvento = [
        ['Nome do Evento:', evento.nome],
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
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      
      // Dados do Cliente
      currentY = verificarQuebraPagina(currentY, 40);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO CLIENTE', margens.left, currentY);
      currentY += 5;

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
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      
      // Dados da Empresa
      currentY = verificarQuebraPagina(currentY, 40);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DA EMPRESA', margens.left, currentY);
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
        margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
        tableWidth: contentWidth,
        body: dadosEmpresa,
        theme: 'plain',
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' }
        }
      });
      currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 15;

      // Tabela de Receitas
      if (receitasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 30);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('RECEITAS', margens.left, currentY);
        currentY += 7;
        
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
            0: { cellWidth: 'auto' }, // Descrição - flexível
            1: { cellWidth: 18, halign: 'center' },
            2: { cellWidth: 32, halign: 'right' },
            3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
          },
          showHead: 'everyPage'
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      }

      // Tabela de Despesas
      if (despesasFiltradas.length > 0) {
        currentY = verificarQuebraPagina(currentY, 30);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('DESPESAS', margens.left, currentY);
        currentY += 7;
        
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
            0: { cellWidth: 'auto' }, // Descrição - flexível
            1: { cellWidth: 38, halign: 'center' },
            2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
          },
          showHead: 'everyPage'
        });
        currentY = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      }

      // Resumo Financeiro
      let yPos = (doc as unknown as AutoTableDocument).lastAutoTable.finalY + 10;
      yPos = verificarQuebraPagina(yPos, 50);

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('RESUMO FINANCEIRO', margens.left, yPos);

      const resumoData = [
        ['Total de Receitas:', `R$ ${totalReceitas.toFixed(2)}`],
        ['Total de Despesas:', `R$ ${totalDespesas.toFixed(2)}`],
        [saldoFinal >= 0 ? 'A RECEBER:' : 'A PAGAR:', `R$ ${Math.abs(saldoFinal).toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: yPos + 5,
        margin: { top: margens.top, right: margens.right, bottom: margens.bottom, left: margens.left },
        tableWidth: contentWidth,
        body: resumoData,
        theme: 'plain',
        styles: { 
          fontSize: 11,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 55, halign: 'right' }
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
      doc.text(notaExplicativa, margens.left, finalY);

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
