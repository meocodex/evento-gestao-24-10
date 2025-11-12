import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovaContaPagarSheet } from '../NovaContaPagarSheet';
import * as financeiroHooks from '@/hooks/financeiro';

// Mocks
vi.mock('@/hooks/financeiro');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NovaContaPagarSheet', () => {
  const mockCriar = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(financeiroHooks.useContasPagar).mockReturnValue({
      criar: {
        mutateAsync: mockCriar,
        isPending: false,
      },
    } as any);
  });

  describe('Rendering', () => {
    it('should render form when open', () => {
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor unitário/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<NovaContaPagarSheet open={false} onOpenChange={mockOnOpenChange} />);

      expect(screen.queryByLabelText(/descrição/i)).not.toBeInTheDocument();
    });

    it('should render all required fields', () => {
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor unitário/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/recorrência/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de vencimento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum description length', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const descricaoInput = screen.getByLabelText(/descrição/i);
      await user.type(descricaoInput, 'AB');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/descrição deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should require payment date when status is paid', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pago'));

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/data de pagamento é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should require payment method when status is paid', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pago'));

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/forma de pagamento é obrigatória/i)).toBeInTheDocument();
      });
    });
  });

  describe('Value Calculation', () => {
    it('should calculate total value correctly', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const quantidadeInput = screen.getByLabelText(/quantidade/i);
      await user.clear(quantidadeInput);
      await user.type(quantidadeInput, '5');

      const valorUnitarioInput = screen.getByLabelText(/valor unitário/i);
      await user.type(valorUnitarioInput, '1000');

      const valorTotalInput = screen.getByLabelText(/valor total/i);
      expect(valorTotalInput).toHaveValue('R$ 5000.00');
    });

    it('should update total when quantity changes', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const valorUnitarioInput = screen.getByLabelText(/valor unitário/i);
      await user.type(valorUnitarioInput, '500');

      const quantidadeInput = screen.getByLabelText(/quantidade/i);
      await user.clear(quantidadeInput);
      await user.type(quantidadeInput, '10');

      const valorTotalInput = screen.getByLabelText(/valor total/i);
      expect(valorTotalInput).toHaveValue('R$ 5000.00');
    });
  });

  describe('Recurrence Options', () => {
    it('should display all recurrence options', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const recorrenciaSelect = screen.getByLabelText(/recorrência/i);
      await user.click(recorrenciaSelect);

      expect(screen.getByText('Único')).toBeInTheDocument();
      expect(screen.getByText('Semanal')).toBeInTheDocument();
      expect(screen.getByText('Quinzenal')).toBeInTheDocument();
      expect(screen.getByText('Mensal')).toBeInTheDocument();
      expect(screen.getByText('Anual')).toBeInTheDocument();
    });

    it('should show recurrence warning when paid and recurring', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const recorrenciaSelect = screen.getByLabelText(/recorrência/i);
      await user.click(recorrenciaSelect);
      await user.click(screen.getByText('Mensal'));

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pago'));

      await waitFor(() => {
        expect(screen.getByText(/próxima ocorrência será gerada automaticamente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Selection', () => {
    it('should show payment fields when status is paid', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pago'));

      await waitFor(() => {
        expect(screen.getByLabelText(/data de pagamento/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/forma de pagamento/i)).toBeInTheDocument();
      });
    });

    it('should hide payment fields when status is not paid', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pendente'));

      expect(screen.queryByLabelText(/data de pagamento/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/forma de pagamento/i)).not.toBeInTheDocument();
    });
  });

  describe('Payment Methods', () => {
    it('should display all payment methods', async () => {
      const user = userEvent.setup();
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);
      await user.click(screen.getByText('Pago'));

      await waitFor(async () => {
        const formaPagamentoSelect = screen.getByLabelText(/forma de pagamento/i);
        await user.click(formaPagamentoSelect);

        expect(screen.getByText('PIX')).toBeInTheDocument();
        expect(screen.getByText('Boleto')).toBeInTheDocument();
        expect(screen.getByText('Transferência')).toBeInTheDocument();
        expect(screen.getByText('Cartão')).toBeInTheDocument();
        expect(screen.getByText('Dinheiro')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockCriar.mockResolvedValue({ success: true });

      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      await user.type(screen.getByLabelText(/descrição/i), 'Aluguel Depósito');
      await user.type(screen.getByLabelText(/categoria/i), 'Infraestrutura');
      
      const quantidadeInput = screen.getByLabelText(/quantidade/i);
      await user.clear(quantidadeInput);
      await user.type(quantidadeInput, '1');
      
      await user.type(screen.getByLabelText(/valor unitário/i), '5000');
      await user.type(screen.getByLabelText(/data de vencimento/i), '2024-12-31');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCriar).toHaveBeenCalledWith(
          expect.objectContaining({
            descricao: 'Aluguel Depósito',
            categoria: 'Infraestrutura',
            quantidade: 1,
            valor_unitario: 5000,
            valor: 5000,
          })
        );
      });
    });

    it('should close sheet after successful submission', async () => {
      const user = userEvent.setup();
      mockCriar.mockResolvedValue({ success: true });

      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      await user.type(screen.getByLabelText(/descrição/i), 'Test');
      await user.type(screen.getByLabelText(/categoria/i), 'Test');
      await user.type(screen.getByLabelText(/valor unitário/i), '100');
      await user.type(screen.getByLabelText(/data de vencimento/i), '2024-12-31');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Optional Fields', () => {
    it('should render optional fields', () => {
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByLabelText(/fornecedor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/responsável/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/observações/i)).toBeInTheDocument();
    });
  });

  describe('Attachments', () => {
    it('should render attachments upload section', () => {
      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByText(/anexos/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should disable submit button when loading', () => {
      vi.mocked(financeiroHooks.useContasPagar).mockReturnValue({
        criar: {
          mutateAsync: mockCriar,
          isPending: true,
        },
      } as any);

      render(<NovaContaPagarSheet open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      expect(submitButton).toBeDisabled();
    });
  });
});
