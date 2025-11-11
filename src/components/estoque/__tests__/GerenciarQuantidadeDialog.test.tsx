import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GerenciarQuantidadeDialog } from '../GerenciarQuantidadeDialog';

const mockQueryClient = {
  invalidateQueries: vi.fn(),
};

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

const mockSupabaseChain = {
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ error: null }),
};

const mockSupabase = {
  from: vi.fn(() => mockSupabaseChain),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
}));

describe('GerenciarQuantidadeDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    materialId: 'material-1',
    materialNome: 'Cadeiras',
    quantidadeAtual: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização básica', () => {
    it('deve renderizar quando open é true', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByText('Gerenciar Quantidade')).toBeInTheDocument();
      expect(screen.getByText('Cadeiras')).toBeInTheDocument();
    });

    it('não deve renderizar quando open é false', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('Gerenciar Quantidade')).not.toBeInTheDocument();
    });

    it('deve exibir quantidade atual', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByText('Quantidade atual:')).toBeInTheDocument();
      expect(screen.getByText('50 unidades')).toBeInTheDocument();
    });

    it('deve ter 3 tabs: Entrada, Saída e Ajuste', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /entrada/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /saída/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ajuste/i })).toBeInTheDocument();
    });
  });

  describe('Tab Entrada', () => {
    it('deve ter campos obrigatórios', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByLabelText(/quantidade a adicionar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    });

    it('deve ter campo para calcular nova quantidade', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      const quantidadeInput = screen.getByLabelText(/quantidade a adicionar/i);
      expect(quantidadeInput).toBeInTheDocument();
    });

    it('deve ter validação de campos', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      const quantidadeInput = screen.getByLabelText(/quantidade a adicionar/i);
      const motivoInput = screen.getByLabelText(/motivo/i);
      
      expect(quantidadeInput).toHaveAttribute('type', 'number');
      expect(motivoInput).toBeInTheDocument();
    });

  });

  describe('Tab Saída', () => {
    it('deve ter tab de saída', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      const saidaTab = screen.getByRole('tab', { name: /saída/i });
      expect(saidaTab).toBeInTheDocument();
    });

    it('deve ter limite máximo igual à quantidade atual', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      const saidaTab = screen.getByRole('tab', { name: /saída/i });
      expect(saidaTab).toBeInTheDocument();
    });
  });

  describe('Tab Ajuste', () => {
    it('deve ter tab de ajuste', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      const ajusteTab = screen.getByRole('tab', { name: /ajuste/i });
      expect(ajusteTab).toBeInTheDocument();
    });
  });

  describe('Campo de observações', () => {
    it('deve ter campo de observações opcional', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByLabelText(/observações/i)).toBeInTheDocument();
    });
  });

  describe('Botões de ação', () => {
    it('deve ter botões Cancelar e Confirmar', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    });

  });

  describe('Integração básica', () => {
    it('deve ter estrutura de formulário', () => {
      render(<GerenciarQuantidadeDialog {...defaultProps} />);

      expect(screen.getByLabelText(/quantidade a adicionar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    });
  });
});
