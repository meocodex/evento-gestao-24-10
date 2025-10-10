import jsPDF from 'jspdf';
import { Contrato, ItemProposta } from '@/types/contratos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PDFOptions {
  papelTimbrado?: string;
  margens?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const margensDefault = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

export async function gerarPDFComTimbrado(
  contrato: Contrato,
  options: PDFOptions = {}
): Promise<void> {
  const margens = options.margens || margensDefault;
  const doc = new jsPDF();
  
  let yPosition = margens.top;

  // Adicionar papel timbrado se fornecido
  if (options.papelTimbrado) {
    try {
      const img = new Image();
      img.src = options.papelTimbrado;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      doc.addImage(img, 'PNG', 0, 0, 210, 297);
      yPosition = margens.top + 40; // Espaço para o timbrado
    } catch (error) {
      console.error('Erro ao adicionar papel timbrado:', error);
    }
  }

  // Configurações de fonte
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - margens.left - margens.right;

  // Título do documento
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titulo = contrato.status === 'proposta' ? 'PROPOSTA COMERCIAL' : 'CONTRATO';
  doc.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Número e data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Número: ${contrato.numero}`, margens.left, yPosition);
  doc.text(
    `Data: ${format(new Date(contrato.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
    pageWidth - margens.right,
    yPosition,
    { align: 'right' }
  );
  yPosition += 10;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margens.left, yPosition, pageWidth - margens.right, yPosition);
  yPosition += 10;

  // Título da proposta/contrato
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(contrato.titulo, margens.left, yPosition);
  yPosition += 10;

  // Dados do Evento (se houver)
  if (contrato.dadosEvento) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados do Evento', margens.left, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${contrato.dadosEvento.nome}`, margens.left, yPosition);
    yPosition += 5;
    doc.text(
      `Período: ${format(new Date(contrato.dadosEvento.dataInicio), 'dd/MM/yyyy')} a ${format(new Date(contrato.dadosEvento.dataFim), 'dd/MM/yyyy')}`,
      margens.left,
      yPosition
    );
    yPosition += 5;
    doc.text(
      `Local: ${contrato.dadosEvento.local} - ${contrato.dadosEvento.cidade}/${contrato.dadosEvento.estado}`,
      margens.left,
      yPosition
    );
    yPosition += 10;
  }

  // Itens da Proposta
  if (contrato.itens && contrato.itens.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Itens', margens.left, yPosition);
    yPosition += 7;

    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const colWidths = {
      descricao: maxWidth * 0.4,
      quantidade: maxWidth * 0.15,
      unidade: maxWidth * 0.15,
      valorUnit: maxWidth * 0.15,
      valorTotal: maxWidth * 0.15,
    };

    let xPos = margens.left;
    doc.text('Descrição', xPos, yPosition);
    xPos += colWidths.descricao;
    doc.text('Qtd.', xPos, yPosition);
    xPos += colWidths.quantidade;
    doc.text('Un.', xPos, yPosition);
    xPos += colWidths.unidade;
    doc.text('Valor Unit.', xPos, yPosition);
    xPos += colWidths.valorUnit;
    doc.text('Valor Total', xPos, yPosition);
    yPosition += 5;

    // Linha da tabela
    doc.setLineWidth(0.3);
    doc.line(margens.left, yPosition, pageWidth - margens.right, yPosition);
    yPosition += 5;

    // Itens
    doc.setFont('helvetica', 'normal');
    let totalGeral = 0;

    contrato.itens.forEach((item: ItemProposta) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = margens.top;
      }

      xPos = margens.left;
      const descricaoLines = doc.splitTextToSize(item.descricao, colWidths.descricao - 5);
      doc.text(descricaoLines, xPos, yPosition);
      
      xPos += colWidths.descricao;
      doc.text(item.quantidade.toString(), xPos, yPosition);
      
      xPos += colWidths.quantidade;
      doc.text(item.unidade, xPos, yPosition);
      
      xPos += colWidths.unidade;
      doc.text(
        item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        xPos,
        yPosition
      );
      
      xPos += colWidths.valorUnit;
      doc.text(
        item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        xPos,
        yPosition
      );

      totalGeral += item.valorTotal;
      yPosition += Math.max(7, descricaoLines.length * 5);
    });

    // Total
    yPosition += 3;
    doc.setLineWidth(0.3);
    doc.line(margens.left, yPosition, pageWidth - margens.right, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(
      `TOTAL: ${totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      pageWidth - margens.right,
      yPosition,
      { align: 'right' }
    );
    yPosition += 10;
  }

  // Condições Comerciais
  if (contrato.status === 'proposta') {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margens.top;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições Comerciais', margens.left, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (contrato.validade) {
      doc.text(`Validade da Proposta: ${contrato.validade}`, margens.left, yPosition);
      yPosition += 6;
    }

    if (contrato.condicoesPagamento) {
      doc.text('Condições de Pagamento:', margens.left, yPosition);
      yPosition += 5;
      const pagamentoLines = doc.splitTextToSize(contrato.condicoesPagamento, maxWidth - 10);
      doc.text(pagamentoLines, margens.left + 5, yPosition);
      yPosition += pagamentoLines.length * 5 + 3;
    }

    if (contrato.prazoExecucao) {
      doc.text(`Prazo de Execução: ${contrato.prazoExecucao}`, margens.left, yPosition);
      yPosition += 6;
    }

    if (contrato.garantia) {
      doc.text(`Garantia: ${contrato.garantia}`, margens.left, yPosition);
      yPosition += 6;
    }

    if (contrato.observacoesComerciais) {
      yPosition += 3;
      doc.text('Observações:', margens.left, yPosition);
      yPosition += 5;
      const obsLines = doc.splitTextToSize(contrato.observacoesComerciais, maxWidth - 10);
      doc.text(obsLines, margens.left + 5, yPosition);
      yPosition += obsLines.length * 5;
    }
  }

  // Assinaturas
  if (contrato.assinaturas && contrato.assinaturas.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = margens.top;
    }

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Assinaturas', margens.left, yPosition);
    yPosition += 15;

    const assinaturaWidth = maxWidth / contrato.assinaturas.length;
    
    contrato.assinaturas.forEach((assinatura, index) => {
      const xPos = margens.left + index * assinaturaWidth;
      
      doc.setLineWidth(0.5);
      doc.line(xPos + 10, yPosition, xPos + assinaturaWidth - 20, yPosition);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(assinatura.nome, xPos + assinaturaWidth / 2, yPosition + 5, { align: 'center' });
      doc.text(assinatura.parte, xPos + assinaturaWidth / 2, yPosition + 10, { align: 'center' });
      
      if (assinatura.assinado && assinatura.dataAssinatura) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(
          `Assinado em ${format(new Date(assinatura.dataAssinatura), 'dd/MM/yyyy HH:mm')}`,
          xPos + assinaturaWidth / 2,
          yPosition + 15,
          { align: 'center' }
        );
      }
    });
  }

  // Salvar PDF
  const nomeArquivo = `${contrato.status === 'proposta' ? 'Proposta' : 'Contrato'}_${contrato.numero}.pdf`;
  doc.save(nomeArquivo);
}

export function gerarPDFProposta(contrato: Contrato, papelTimbrado?: string): Promise<void> {
  return gerarPDFComTimbrado(contrato, { papelTimbrado });
}

export function gerarPDFContrato(contrato: Contrato, papelTimbrado?: string): Promise<void> {
  return gerarPDFComTimbrado(contrato, { papelTimbrado });
}
