import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TabelaContasPagar } from '../TabelaContasPagar';
import type { ContaPagar } from '@/types/financeiro';
import { createMockContaPagar, createMockAnexo } from '../../../../tests/helpers/test-data-builders';

describe('TabelaContasPagar', () => {
  const mockContas: ContaPagar[] = [
    createMockContaPagar({
      id: '1',
      descricao: 'Conta de Luz',
      categoria: 'Utilidades',
      fornecedor: 'Companhia Elétrica',
      valor: 150.50,
      valor_unitario: 150.50,
      status: 'pendente',
      data_vencimento: '2024-01-20',
      recorrencia: 'unico',
    }),
    createMockContaPagar({
      id: '2',
      descricao: 'Aluguel',
      categoria: 'Despesas Fixas',
      fornecedor: 'Imobiliária XYZ',
      valor: 2500.00,
      valor_unitario: 2500.00,
      status: 'pago',
      data_vencimento: '2024-01-10',
      data_pagamento: '2024-01-09',
      recorrencia: 'mensal',
      anexos: [createMockAnexo({ nome: 'comprovante.pdf' })],
    }),
    createMockContaPagar({
      id: '3',
      descricao: 'Material de Escritório',
      categoria: 'Suprimentos',
      fornecedor: null,
      valor: 75.30,
      valor_unitario: 75.30,
      status: 'vencido',
      data_vencimento: '2024-01-05',
      recorrencia: 'unico',
    }),
    createMockContaPagar({
      id: '4',
      descricao: 'Assinatura Software',
      categoria: 'TI',
      fornecedor: 'Software Inc',
      valor: 299.99,
      valor_unitario: 299.99,
      status: 'cancelado',
      data_vencimento: '2024-01-15',
      recorrencia: 'mensal',
    }),
  ];

  const mockCallbacks = {
    onDetalhes: vi.fn(),
    onEditar: vi.fn(),
    onMarcarPago: vi.fn(),
    onExcluir: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar a tabela com todas as colunas', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Vencimento')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Fornecedor')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar todas as contas fornecidas', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      expect(screen.getByText('Aluguel')).toBeInTheDocument();
      expect(screen.getByText('Material de Escritório')).toBeInTheDocument();
      expect(screen.getByText('Assinatura Software')).toBeInTheDocument();
    });

    it('deve renderizar EmptyState com array vazio', () => {
      render(<TabelaContasPagar contas={[]} {...mockCallbacks} />);

      expect(screen.getByText('Nenhuma conta encontrada')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Exportação e contador', () => {
    it('deve exibir botões de exportação PDF e Excel', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
    });

    it('deve exibir contador de resultados singular', () => {
      render(<TabelaContasPagar contas={[mockContas[0]]} {...mockCallbacks} />);

      expect(screen.getByText('1 conta encontrada')).toBeInTheDocument();
    });

    it('deve exibir contador de resultados plural', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('4 contas encontradas')).toBeInTheDocument();
    });
  });

  describe('Formatação de dados', () => {
    it('deve formatar datas corretamente', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('20/01/2024')).toBeInTheDocument();
      expect(screen.getByText('10/01/2024')).toBeInTheDocument();
    });

    it('deve formatar valores monetários', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('R$ 150,50')).toBeInTheDocument();
      expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 75,30')).toBeInTheDocument();
    });

    it('deve exibir traço quando não há fornecedor', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const rows = screen.getAllByRole('row');
      const materialRow = rows.find(row => row.textContent?.includes('Material de Escritório'));
      expect(materialRow).toHaveTextContent('-');
    });
  });

  describe('Badges de status', () => {
    it('deve exibir badge "Pendente" corretamente', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });

    it('deve exibir badge "Pago" corretamente', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Pago')).toBeInTheDocument();
    });

    it('deve exibir badge "Vencido" corretamente', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Vencido')).toBeInTheDocument();
    });

    it('deve exibir badge "Cancelado" corretamente', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByText('Cancelado')).toBeInTheDocument();
    });
  });

  describe('Ícones indicadores', () => {
    it('deve exibir ícone de recorrência', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const rows = screen.getAllByRole('row');
      const aluguelRow = rows.find(row => row.textContent?.includes('Aluguel'));
      
      expect(aluguelRow).toBeInTheDocument();
    });

    it('deve exibir ícone de anexo quando há anexos', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const rows = screen.getAllByRole('row');
      const aluguelRow = rows.find(row => row.textContent?.includes('Aluguel'));
      
      expect(aluguelRow).toBeInTheDocument();
    });
  });

  describe('Ações', () => {
    it('deve chamar onDetalhes ao clicar no botão de detalhes', async () => {
      const user = userEvent.setup();
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const viewButtons = screen.getAllByRole('button', { name: /ver detalhes/i });
      await user.click(viewButtons[0]);

      expect(mockCallbacks.onDetalhes).toHaveBeenCalledWith(mockContas[0]);
    });

    it('deve chamar onEditar ao clicar no botão de editar', async () => {
      const user = userEvent.setup();
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      expect(mockCallbacks.onEditar).toHaveBeenCalledWith(mockContas[0]);
    });

    it('deve chamar onMarcarPago ao clicar no botão de marcar pago', async () => {
      const user = userEvent.setup();
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const payButtons = screen.getAllByRole('button', { name: /marcar como pago/i });
      await user.click(payButtons[0]);

      expect(mockCallbacks.onMarcarPago).toHaveBeenCalledWith(mockContas[0]);
    });

    it('deve chamar onExcluir ao clicar no botão de excluir', async () => {
      const user = userEvent.setup();
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      expect(mockCallbacks.onExcluir).toHaveBeenCalledWith(mockContas[0].id);
    });

    it('não deve mostrar botão marcar pago para contas já pagas', () => {
      render(<TabelaContasPagar contas={[mockContas[1]]} {...mockCallbacks} />);

      const payButtons = screen.queryAllByRole('button', { name: /marcar como pago/i });
      expect(payButtons.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente com muitas contas', () => {
      const muitasContas = Array.from({ length: 100 }, (_, i) =>
        createMockContaPagar({
          id: `conta-${i}`,
          descricao: `Conta ${i}`,
        })
      );

      const startTime = performance.now();
      render(<TabelaContasPagar contas={muitasContas} {...mockCallbacks} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com valores monetários grandes', () => {
      const contaGrande = createMockContaPagar({
        id: 'grande',
        valor: 1000000.99,
        valor_unitario: 1000000.99,
      });

      render(<TabelaContasPagar contas={[contaGrande]} {...mockCallbacks} />);

      expect(screen.getByText('R$ 1.000.000,99')).toBeInTheDocument();
    });

    it('deve lidar com descrições longas', () => {
      const contaDescricaoLonga = createMockContaPagar({
        id: 'longa',
        descricao: 'Descrição muito longa que pode quebrar o layout da tabela se não for tratada corretamente',
      });

      render(<TabelaContasPagar contas={[contaDescricaoLonga]} {...mockCallbacks} />);

      expect(screen.getByText(/Descrição muito longa/)).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura de tabela acessível', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('deve ter botões de ação com aria-labels', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getAllByRole('button', { name: /ver detalhes/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /editar/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /excluir/i }).length).toBeGreaterThan(0);
    });
  });
});
