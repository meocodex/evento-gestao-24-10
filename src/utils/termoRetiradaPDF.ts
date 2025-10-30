import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import type { DadosRetirada } from '@/types/estoque';

export async function gerarTermoRetirada(dados: DadosRetirada): Promise<Blob> {
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
  doc.text('TERMO DE RETIRADA DE MATERIAIS', 105, yPos, { align: 'center' });
  yPos += 10;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Protocolo e Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const protocolo = `TERMO-${Date.now().toString().slice(-8)}`;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.text(`Protocolo: ${protocolo}`, 20, yPos);
  doc.text(`Data de Emissão: ${dataEmissao}`, 140, yPos);
  yPos += 10;

  // Dados da Empresa (Remetente)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REMETENTE (EMPRESA)', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Nome/Razão Social: ${dados.dadosEmpresa.nome}`, 20, 170);
  addText(`CNPJ: ${dados.dadosEmpresa.cnpj}`, 20, 170);
  addText(`Telefone: ${dados.dadosEmpresa.telefone}`, 20, 170);
  addText(`Endereço: ${dados.dadosEmpresa.endereco}`, 20, 170);
  yPos += 5;

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

  // Dados do Responsável pela Retirada
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESPONSÁVEL PELA RETIRADA', 20, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addText(`Nome Completo: ${dados.retiradoPorNome}`, 20, 170);
  addText(`CPF/RG: ${dados.retiradoPorDocumento}`, 20, 170);
  addText(`Telefone: ${dados.retiradoPorTelefone}`, 20, 170);
  yPos += 5;

  // Materiais
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MATERIAIS RETIRADOS', 20, yPos);
  yPos += 7;

  // Tabela de materiais
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Serial', 20, yPos);
  doc.text('Nome', 60, yPos);
  doc.text('Localização', 120, yPos);
  doc.text('Valor', 170, yPos);
  yPos += 5;

  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  dados.materiais.forEach((material) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(material.serial, 20, yPos);
    doc.text(material.nome.substring(0, 25), 60, yPos);
    doc.text(material.localizacao, 120, yPos);
    const valor = material.valorDeclarado 
      ? `R$ ${material.valorDeclarado.toFixed(2)}` 
      : '-';
    doc.text(valor, 170, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Termo de Responsabilidade
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE', 20, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const termoTexto = `Declaro, sob as penas da lei, que recebi os materiais acima discriminados em perfeitas condições de uso e funcionamento. Comprometo-me a zelar pela integridade dos mesmos e a devolvê-los nas mesmas condições em que foram retirados. Reconheço que sou o único responsável pelos materiais durante o período em que estiverem sob minha guarda, respondendo civil e criminalmente por qualquer dano, perda ou extravio.`;
  
  addText(termoTexto, 20, 170, 9);
  yPos += 10;

  // Campos de assinatura
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 20, 90, yPos + 20);
  doc.line(120, yPos + 20, 190, yPos + 20);
  
  doc.setFontSize(8);
  doc.text('Assinatura do Responsável pela Retirada', 55, yPos + 25, { align: 'center' });
  doc.text('Assinatura do Representante da Empresa', 155, yPos + 25, { align: 'center' });

  return doc.output('blob');
}

export async function uploadTermoRetirada(
  blob: Blob,
  eventoId: string,
  materialId: string
): Promise<string> {
  const fileName = `termo-retirada-${eventoId}-${materialId}-${Date.now()}.pdf`;

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
