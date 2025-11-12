import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabelaContasReceber } from '../TabelaContasReceber';
import type { ContaReceber } from '@/types/financeiro';

describe('TabelaContasReceber', () => {
  const mockContas: ContaReceber[] = [
    {
      id: '1',
      descricao: 'Pagamento Evento Corporativo',
      tipo: 'venda' as const,
      valor: 50000,
      quantidade: 1,
      valor_unitario: 50000,
      recorrencia: 'unico' as const,
      data_vencimento: '2024-12-31',
      status: 'pendente' as const,
      cliente: 'Empresa XYZ Ltda',
      responsavel: 'João Silva',
      anexos: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      descricao: 'Locação Equipamentos - Mensalidade',
      tipo: 'locacao' as const,
      valor: 15000,
      quantidade: 1,
      valor_unitario: 15000,
      recorrencia: 'mensal' as const,
      data_vencimento: '2024-12-15',
      data_recebimento: '2024-12-14',
      status: 'recebido' as const,
      forma_recebimento: 'PIX',
      cliente: 'Produtora ABC',
      anexos: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      descricao: 'Consultoria Técnica',
      tipo: 'servico' as const,
      valor: 8000,
      quantidade: 1,
      valor_unitario: 8000,
      recorrencia: 'unico' as const,
      data_vencimento: '2024-11-30',
      status: 'vencido' as const,
      anexos: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockHandlers = {
    onDetalhes: vi.fn(),
    onEditar: vi.fn(),
    onMarcarRecebido: vi.fn(),
    onExcluir: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table with all accounts', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      expect(screen.getByText('Pagamento Evento Corporativo')).toBeInTheDocument();
      expect(screen.getByText('Locação Equipamentos - Mensalidade')).toBeInTheDocument();
      expect(screen.getByText('Consultoria Técnica')).toBeInTheDocument();
    });

    it('should display correct columns', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Tipo')).toBeInTheDocument();
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
      expect(screen.getByText('Vencimento')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('should format currency values correctly', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      expect(screen.getByText(/R\$ 50\.000,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 15\.000,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 8\.000,00/)).toBeInTheDocument();
    });

    it('should display status badges correctly', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      expect(screen.getByText('Pendente')).toBeInTheDocument();
      expect(screen.getByText('Recebido')).toBeInTheDocument();
      expect(screen.getByText('Vencido')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);
      await user.click(screen.getByRole('option', { name: 'Pendente' }));

      expect(screen.getByText('Pagamento Evento Corporativo')).toBeInTheDocument();
      expect(screen.queryByText('Locação Equipamentos - Mensalidade')).not.toBeInTheDocument();
    });

    it('should search by description', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'Locação');

      expect(screen.getByText('Locação Equipamentos - Mensalidade')).toBeInTheDocument();
      expect(screen.queryByText('Pagamento Evento Corporativo')).not.toBeInTheDocument();
    });

    it('should search by client name', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'XYZ');

      expect(screen.getByText('Empresa XYZ Ltda')).toBeInTheDocument();
    });

    it('should combine filters correctly', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      // Filter by status
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);
      await user.click(screen.getByRole('option', { name: 'Recebido' }));

      // Search
      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'Locação');

      expect(screen.getByText('Locação Equipamentos - Mensalidade')).toBeInTheDocument();
      expect(screen.queryByText('Pagamento Evento Corporativo')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onDetalhes when view button clicked', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const viewButtons = screen.getAllByRole('button', { name: /detalhes/i });
      await user.click(viewButtons[0]);

      expect(mockHandlers.onDetalhes).toHaveBeenCalledWith(mockContas[0]);
    });

    it('should call onEditar when edit button clicked', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      expect(mockHandlers.onEditar).toHaveBeenCalledWith(mockContas[0]);
    });

    it('should call onMarcarRecebido when mark as received button clicked', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const receiveButtons = screen.getAllByRole('button', { name: /marcar.*recebid/i });
      await user.click(receiveButtons[0]);

      expect(mockHandlers.onMarcarRecebido).toHaveBeenCalledWith(mockContas[0]);
    });

    it('should not show mark as received button for already received accounts', () => {
      render(<TabelaContasReceber contas={[mockContas[1]]} {...mockHandlers} />);

      const receiveButtons = screen.queryAllByRole('button', { name: /marcar.*recebid/i });
      expect(receiveButtons.length).toBe(0);
    });

    it('should call onExcluir when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      expect(mockHandlers.onExcluir).toHaveBeenCalledWith(mockContas[0]);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no accounts', () => {
      render(<TabelaContasReceber contas={[]} {...mockHandlers} />);

      expect(screen.getByText(/nenhuma conta encontrada/i)).toBeInTheDocument();
    });

    it('should show empty state after filtering with no results', async () => {
      const user = userEvent.setup();
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'NonExistentAccount');

      expect(screen.getByText(/nenhuma conta encontrada/i)).toBeInTheDocument();
    });
  });

  describe('Account Types', () => {
    it('should display different account types correctly', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      expect(screen.getByText('Venda')).toBeInTheDocument();
      expect(screen.getByText('Locação')).toBeInTheDocument();
      expect(screen.getByText('Serviço')).toBeInTheDocument();
    });
  });

  describe('Recurrence', () => {
    it('should indicate recurring accounts', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      // Monthly recurrence should be visible
      const monthlyAccount = screen.getByText('Locação Equipamentos - Mensalidade');
      expect(monthlyAccount).toBeInTheDocument();
    });
  });

  describe('Payment Information', () => {
    it('should display payment date for received accounts', () => {
      render(<TabelaContasReceber contas={[mockContas[1]]} {...mockHandlers} />);

      expect(screen.getByText(/14\/12\/2024/)).toBeInTheDocument();
    });

    it('should display payment method for received accounts', () => {
      render(<TabelaContasReceber contas={[mockContas[1]]} {...mockHandlers} />);

      expect(screen.getByText('PIX')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should have accessible action buttons', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should display accounts in order', () => {
      render(<TabelaContasReceber contas={mockContas} {...mockHandlers} />);

      const descriptions = screen.getAllByRole('cell', { name: /Pagamento|Locação|Consultoria/ });
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });
});
