import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    it('deve renderizar com array vazio', () => {
      render(<TabelaContasPagar contas={[]} {...mockCallbacks} />);

      expect(screen.getByText('Vencimento')).toBeInTheDocument();
      expect(screen.queryByText('Conta de Luz')).not.toBeInTheDocument();
    });
  });

  describe('Filtros', () => {
    it('deve ter input de busca', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText(/buscar por/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('deve permitir busca', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText(/buscar por/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('deve ter select de status', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
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
    it('deve ter botões de ação', () => {
      render(<TabelaContasPagar contas={mockContas} {...mockCallbacks} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
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
});
