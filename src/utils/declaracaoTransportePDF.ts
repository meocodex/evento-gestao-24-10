import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import type { DadosDeclaracaoTransporte } from '@/types/estoque';

export async function gerarDeclaracaoTransporte(dados: DadosDeclaracaoTransporte): Promise<Blob> {
  const doc = new jsPDF();
  let yPos = 20;

  // Função auxiliar para adicionar texto com quebra automática
  const addText = (text: string, x: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, yPos);
    yPos += lines.length * (fontSize * 0.5);
  };

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÃO DE TRANSPORTE DE MERCADORIAS', 105, yPos, { align: 'center' });
  yPos += 10;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Protocolo e Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const protocolo = `DECL-${Date.now().toString().slice(-8)}`;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.text(`Protocolo: ${protocolo}`, 20, yPos);
  doc.text(`Data de Emissão: ${dataEmissao}`, 140, yPos);
  yPos += 10;

  // Dados do Remetente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REMETENTE', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Nome: ${dados.remetenteNome}`, 20, 170);
  addText(`Documento: ${dados.remetenteDocumento}`, 20, 170);
  addText(`Telefone: ${dados.remetenteTelefone}`, 20, 170);
  
  if (dados.remetenteEndereco) {
    addText(`Endereço: ${dados.remetenteEndereco}`, 20, 170);
  }
  
  if (dados.remetenteVinculo) {
    addText(`Vínculo: ${dados.remetenteVinculo}`, 20, 170);
  }
  
  yPos += 5;

  // Dados do Destinatário
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATÁRIO', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Nome: ${dados.destinatarioNome}`, 20, 170);
  addText(`Documento: ${dados.destinatarioDocumento}`, 20, 170);
  addText(`Telefone: ${dados.destinatarioTelefone}`, 20, 170);
  addText(`Endereço: ${dados.destinatarioEndereco}`, 20, 170);
  yPos += 5;

  // Dados da Transportadora (se houver)
  if (dados.transportadoraNome) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSPORTADORA', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addText(`Nome: ${dados.transportadoraNome}`, 20, 170);
    if (dados.transportadoraCNPJ) {
      addText(`CNPJ: ${dados.transportadoraCNPJ}`, 20, 170);
    }
    if (dados.transportadoraTelefone) {
      addText(`Telefone: ${dados.transportadoraTelefone}`, 20, 170);
    }
    yPos += 5;
  }

  // Dados do Evento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO EVENTO', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Nome do Evento: ${dados.eventoNome}`, 20, 170);
  addText(`Local: ${dados.eventoLocal}`, 20, 170);
  addText(`Data/Hora: ${dados.eventoData} às ${dados.eventoHora}`, 20, 170);
  yPos += 5;

  // Materiais
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MERCADORIAS TRANSPORTADAS', 20, yPos);
  yPos += 7;

  // Tabela de materiais
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Serial', 20, yPos);
  doc.text('Descrição', 70, yPos);
  doc.text('Valor Declarado', 160, yPos);
  yPos += 5;

  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  let valorTotal = 0;
  doc.setFont('helvetica', 'normal');
  dados.materiais.forEach((material) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(material.serial, 20, yPos);
    doc.text(material.nome.substring(0, 35), 70, yPos);
    const valor = `R$ ${material.valorDeclarado.toFixed(2)}`;
    doc.text(valor, 160, yPos);
    valorTotal += material.valorDeclarado;
    yPos += 6;
  });

  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR TOTAL DECLARADO: R$ ${valorTotal.toFixed(2)}`, 160, yPos, { align: 'right' });
  yPos += 10;

  // Observações (se houver)
  if (dados.observacoes) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    addText(dados.observacoes, 20, 170, 9);
    yPos += 5;
  }

  // Declaração
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÃO', 20, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const declaracaoTexto = `Declaro, para os devidos fins, que as mercadorias acima relacionadas estão sendo transportadas para o evento mencionado. Os valores declarados correspondem ao valor real dos equipamentos. O remetente e/ou a empresa contratante se responsabilizam pelos equipamentos durante todo o período de transporte e utilização.`;
  
  addText(declaracaoTexto, 20, 170, 9);
  yPos += 10;

  // Campos de assinatura
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 20, 90, yPos + 20);
  doc.line(120, yPos + 20, 190, yPos + 20);
  
  doc.setFontSize(8);
  doc.text('Assinatura do Remetente', 55, yPos + 25, { align: 'center' });
  doc.text('Assinatura do Destinatário', 155, yPos + 25, { align: 'center' });

  return doc.output('blob');
}

export async function uploadDeclaracaoTransporte(
  blob: Blob,
  eventoId: string,
  materialId: string
): Promise<string> {
  const fileName = `declaracao-transporte-${eventoId}-${materialId}-${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from('documentos-transporte')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('documentos-transporte')
    .getPublicUrl(fileName);

  return publicUrl;
}
