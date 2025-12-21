import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ContaPagar, ContaReceber } from '@/types/financeiro';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: string) => 
  format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    recebido: 'Recebido',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
};

// Contas a Pagar - PDF
export async function exportarContasPagarPDF(contas: ContaPagar[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(239, 68, 68); // Red color
  doc.text('Contas a Pagar', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exportado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);
  doc.text(`Total de registros: ${contas.length}`, 14, 36);
  
  // Calculate totals
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, c) => acc + Number(c.valor), 0);
  const totalPago = contas.filter(c => c.status === 'pago').reduce((acc, c) => acc + Number(c.valor), 0);
  
  doc.text(`Total Pendente: ${formatCurrency(totalPendente)}`, 14, 42);
  doc.text(`Total Pago: ${formatCurrency(totalPago)}`, 100, 42);
  
  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Vencimento', 'Descrição', 'Categoria', 'Fornecedor', 'Valor', 'Status']],
    body: contas.map(c => [
      formatDate(c.data_vencimento),
      c.descricao.length > 30 ? c.descricao.substring(0, 30) + '...' : c.descricao,
      c.categoria,
      c.fornecedor || '-',
      formatCurrency(Number(c.valor)),
      getStatusLabel(c.status)
    ]),
    theme: 'striped',
    headStyles: { 
      fillColor: [239, 68, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      4: { halign: 'right' },
      5: { cellWidth: 22 }
    }
  });
  
  doc.save(`contas_a_pagar_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Contas a Pagar - Excel/CSV
export function exportarContasPagarExcel(contas: ContaPagar[]) {
  const headers = ['Vencimento', 'Descrição', 'Categoria', 'Fornecedor', 'Valor', 'Status', 'Recorrência', 'Observações'];
  
  const rows = contas.map(c => [
    formatDate(c.data_vencimento),
    `"${c.descricao.replace(/"/g, '""')}"`,
    c.categoria,
    c.fornecedor || '',
    Number(c.valor).toFixed(2).replace('.', ','),
    getStatusLabel(c.status),
    c.recorrencia,
    c.observacoes ? `"${c.observacoes.replace(/"/g, '""')}"` : ''
  ]);
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contas_a_pagar_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Contas a Receber - PDF
export async function exportarContasReceberPDF(contas: ContaReceber[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('Contas a Receber', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exportado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);
  doc.text(`Total de registros: ${contas.length}`, 14, 36);
  
  // Calculate totals
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, c) => acc + Number(c.valor), 0);
  const totalRecebido = contas.filter(c => c.status === 'recebido').reduce((acc, c) => acc + Number(c.valor), 0);
  
  doc.text(`Total Pendente: ${formatCurrency(totalPendente)}`, 14, 42);
  doc.text(`Total Recebido: ${formatCurrency(totalRecebido)}`, 100, 42);
  
  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Vencimento', 'Descrição', 'Tipo', 'Cliente', 'Valor', 'Status']],
    body: contas.map(c => [
      formatDate(c.data_vencimento),
      c.descricao.length > 30 ? c.descricao.substring(0, 30) + '...' : c.descricao,
      c.tipo,
      c.cliente || '-',
      formatCurrency(Number(c.valor)),
      getStatusLabel(c.status)
    ]),
    theme: 'striped',
    headStyles: { 
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      4: { halign: 'right' },
      5: { cellWidth: 22 }
    }
  });
  
  doc.save(`contas_a_receber_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Contas a Receber - Excel/CSV
export function exportarContasReceberExcel(contas: ContaReceber[]) {
  const headers = ['Vencimento', 'Descrição', 'Tipo', 'Cliente', 'Valor', 'Status', 'Recorrência', 'Observações'];
  
  const rows = contas.map(c => [
    formatDate(c.data_vencimento),
    `"${c.descricao.replace(/"/g, '""')}"`,
    c.tipo,
    c.cliente || '',
    Number(c.valor).toFixed(2).replace('.', ','),
    getStatusLabel(c.status),
    c.recorrencia,
    c.observacoes ? `"${c.observacoes.replace(/"/g, '""')}"` : ''
  ]);
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contas_a_receber_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
