import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovoEventoSheet } from '../NovoEventoSheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as viacepModule from '@/lib/api/viacep';

// Mock do hook useEventos
const mockCriarEvento = {
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
};

vi.mock('@/hooks/eventos', () => ({
  useEventos: () => ({
    criarEvento: mockCriarEvento,
  }),
}));

// Mock do ClienteSelect e ComercialSelect
vi.mock('../ClienteSelect', () => ({
  ClienteSelect: ({ value, onChange }: any) => (
    <select
      data-testid="cliente-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Selecione um cliente</option>
      <option value="cliente-1">Cliente 1</option>
      <option value="cliente-2">Cliente 2</option>
    </select>
  ),
}));

vi.mock('../ComercialSelect', () => ({
  ComercialSelect: ({ value, onChange }: any) => (
    <select
      data-testid="comercial-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Selecione um comercial</option>
      <option value="comercial-1">Comercial 1</option>
      <option value="comercial-2">Comercial 2</option>
    </select>
  ),
}));

// Mock da API ViaCEP
vi.mock('@/lib/api/viacep');

// Mock do toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('NovoEventoSheet', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onEventoCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCriarEvento.isPending = false;
    mockCriarEvento.mutateAsync.mockResolvedValue({});
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o formulário quando open é true', () => {
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/nome do evento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data e hora de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/local/i)).toBeInTheDocument();
    });

    it('não deve renderizar o formulário quando open é false', () => {
      render(<NovoEventoSheet {...defaultProps} open={false} />, { wrapper: createWrapper() });

      expect(screen.queryByLabelText(/nome do evento/i)).not.toBeInTheDocument();
    });

    it('deve renderizar todos os campos obrigatórios', () => {
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/nome do evento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data e hora de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data e hora de término/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/local/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/logradouro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bairro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
    });

    it('deve renderizar campos opcionais', () => {
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/complemento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });
  });

  describe('Validação de Campos', () => {
    it('deve exibir erro quando cliente não é selecionado', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Campos obrigatórios',
            description: expect.stringContaining('cliente'),
            variant: 'destructive',
          })
        );
      });
    });

    it('deve exibir erro quando comercial não é selecionado', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      // Selecionar apenas cliente
      const clienteSelect = screen.getByTestId('cliente-select');
      await user.selectOptions(clienteSelect, 'cliente-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Campos obrigatórios',
            description: expect.stringContaining('comercial'),
            variant: 'destructive',
          })
        );
      });
    });

    it('deve exibir erro quando data de término é anterior à data de início', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const dataInicioInput = screen.getByLabelText(/data e hora de início/i);
      const dataFimInput = screen.getByLabelText(/data e hora de término/i);

      await user.type(dataInicioInput, '2025-12-31T20:00');
      await user.type(dataFimInput, '2025-12-30T18:00');

      const clienteSelect = screen.getByTestId('cliente-select');
      const comercialSelect = screen.getByTestId('comercial-select');
      await user.selectOptions(clienteSelect, 'cliente-1');
      await user.selectOptions(comercialSelect, 'comercial-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Data inválida',
            variant: 'destructive',
          })
        );
      });
    });

    it('deve exibir erro quando campos de endereço estão vazios', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const clienteSelect = screen.getByTestId('cliente-select');
      const comercialSelect = screen.getByTestId('comercial-select');
      await user.selectOptions(clienteSelect, 'cliente-1');
      await user.selectOptions(comercialSelect, 'comercial-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Campos obrigatórios',
            description: expect.stringContaining('logradouro'),
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Busca de CEP', () => {
    it('deve buscar endereço automaticamente ao digitar CEP válido', async () => {
      const user = userEvent.setup();
      const mockEndereco = {
        cep: '78000-000',
        logradouro: 'Rua Teste',
        complemento: '',
        bairro: 'Bairro Teste',
        localidade: 'Cuiabá',
        uf: 'MT',
      };

      vi.spyOn(viacepModule, 'buscarEnderecoPorCEP').mockResolvedValue(mockEndereco);

      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '78000000');

      await waitFor(() => {
        expect(viacepModule.buscarEnderecoPorCEP).toHaveBeenCalled();
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'CEP encontrado!',
          })
        );
      });
    });

    it('deve exibir loading durante busca de CEP', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(viacepModule, 'buscarEnderecoPorCEP').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '78000000');

      // O ícone de loading deve aparecer
      await waitFor(() => {
        const loadingIcon = screen.queryByRole('status') || document.querySelector('.animate-spin');
        expect(loadingIcon).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando CEP não é encontrado', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(viacepModule, 'buscarEnderecoPorCEP').mockRejectedValue(new Error('CEP não encontrado'));

      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '99999999');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'CEP não encontrado',
            variant: 'destructive',
          })
        );
      }, { timeout: 2000 });
    });

    it('deve formatar CEP durante digitação', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const cepInput = screen.getByLabelText(/cep/i) as HTMLInputElement;
      await user.type(cepInput, '78000000');

      expect(cepInput.value).toMatch(/\d{5}-\d{3}/);
    });
  });

  describe('Gerenciamento de Tags', () => {
    it('deve adicionar tag ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'Casamento');

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      expect(screen.getByText('Casamento')).toBeInTheDocument();
    });

    it('deve adicionar tag ao pressionar Enter', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'Premium{Enter}');

      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('deve remover tag ao clicar no X', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'Teste');

      const addButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(addButton);

      const removeButton = screen.getByRole('button', { name: '' });
      await user.click(removeButton);

      expect(screen.queryByText('Teste')).not.toBeInTheDocument();
    });

    it('não deve adicionar tag duplicada', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const tagInput = screen.getByLabelText(/tags/i);
      const addButton = screen.getByRole('button', { name: /adicionar/i });

      await user.type(tagInput, 'Duplicada');
      await user.click(addButton);

      await user.type(tagInput, 'Duplicada');
      await user.click(addButton);

      const tags = screen.getAllByText('Duplicada');
      expect(tags.length).toBe(1);
    });

    it('não deve adicionar tag vazia', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const tagInput = screen.getByLabelText(/tags/i);
      const addButton = screen.getByRole('button', { name: /adicionar/i });

      await user.type(tagInput, '   ');
      await user.click(addButton);

      const badges = screen.queryAllByRole('status');
      expect(badges.length).toBe(0);
    });
  });

  describe('Submissão do Formulário', () => {
    it('deve criar evento com sucesso', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/nome do evento/i), 'Evento Teste');
      await user.type(screen.getByLabelText(/data e hora de início/i), '2025-12-25T18:00');
      await user.type(screen.getByLabelText(/data e hora de término/i), '2025-12-25T23:00');
      await user.type(screen.getByLabelText(/local/i), 'Buffet Teste');
      await user.type(screen.getByLabelText(/logradouro/i), 'Rua Teste');
      await user.type(screen.getByLabelText(/número/i), '123');
      await user.type(screen.getByLabelText(/bairro/i), 'Centro');
      await user.type(screen.getByLabelText(/cidade/i), 'Cuiabá');
      await user.type(screen.getByLabelText(/estado/i), 'MT');

      const clienteSelect = screen.getByTestId('cliente-select');
      const comercialSelect = screen.getByTestId('comercial-select');
      await user.selectOptions(clienteSelect, 'cliente-1');
      await user.selectOptions(comercialSelect, 'comercial-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCriarEvento.mutateAsync).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
        expect(defaultProps.onEventoCreated).toHaveBeenCalled();
      });
    });

    it('deve exibir erro ao falhar na criação', async () => {
      const user = userEvent.setup();
      mockCriarEvento.mutateAsync.mockRejectedValue(new Error('Erro ao criar'));

      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/nome do evento/i), 'Evento Teste');
      await user.type(screen.getByLabelText(/data e hora de início/i), '2025-12-25T18:00');
      await user.type(screen.getByLabelText(/data e hora de término/i), '2025-12-25T23:00');
      await user.type(screen.getByLabelText(/local/i), 'Buffet Teste');
      await user.type(screen.getByLabelText(/logradouro/i), 'Rua Teste');
      await user.type(screen.getByLabelText(/número/i), '123');
      await user.type(screen.getByLabelText(/bairro/i), 'Centro');
      await user.type(screen.getByLabelText(/cidade/i), 'Cuiabá');
      await user.type(screen.getByLabelText(/estado/i), 'MT');

      const clienteSelect = screen.getByTestId('cliente-select');
      const comercialSelect = screen.getByTestId('comercial-select');
      await user.selectOptions(clienteSelect, 'cliente-1');
      await user.selectOptions(comercialSelect, 'comercial-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao criar evento',
            variant: 'destructive',
          })
        );
      });
    });

    it('deve incluir tags na criação do evento', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      // Adicionar tags
      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'Casamento');
      await user.click(screen.getByRole('button', { name: /adicionar/i }));

      // Preencher outros campos obrigatórios
      await user.type(screen.getByLabelText(/nome do evento/i), 'Evento Teste');
      await user.type(screen.getByLabelText(/data e hora de início/i), '2025-12-25T18:00');
      await user.type(screen.getByLabelText(/data e hora de término/i), '2025-12-25T23:00');
      await user.type(screen.getByLabelText(/local/i), 'Buffet Teste');
      await user.type(screen.getByLabelText(/logradouro/i), 'Rua Teste');
      await user.type(screen.getByLabelText(/número/i), '123');
      await user.type(screen.getByLabelText(/bairro/i), 'Centro');
      await user.type(screen.getByLabelText(/cidade/i), 'Cuiabá');
      await user.type(screen.getByLabelText(/estado/i), 'MT');

      const clienteSelect = screen.getByTestId('cliente-select');
      const comercialSelect = screen.getByTestId('comercial-select');
      await user.selectOptions(clienteSelect, 'cliente-1');
      await user.selectOptions(comercialSelect, 'comercial-1');

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCriarEvento.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['Casamento'],
          })
        );
      });
    });
  });

  describe('Cancelamento', () => {
    it('deve limpar formulário ao cancelar', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/nome do evento/i), 'Evento Teste');

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Estado de Loading', () => {
    it('deve desabilitar botão durante submissão', async () => {
      mockCriarEvento.isPending = true;
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /criar evento/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Formatação de Estado', () => {
    it('deve converter estado para maiúsculas', async () => {
      const user = userEvent.setup();
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const estadoInput = screen.getByLabelText(/estado/i) as HTMLInputElement;
      await user.type(estadoInput, 'mt');

      expect(estadoInput.value).toBe('MT');
    });

    it('deve limitar estado a 2 caracteres', () => {
      render(<NovoEventoSheet {...defaultProps} />, { wrapper: createWrapper() });

      const estadoInput = screen.getByLabelText(/estado/i) as HTMLInputElement;
      expect(estadoInput.maxLength).toBe(2);
    });
  });
});
