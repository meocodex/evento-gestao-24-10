import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovoMaterialSheet } from '../NovoMaterialSheet';
import * as estoqueHooks from '@/hooks/estoque';
import * as categoriasHooks from '@/hooks/categorias';
import * as permissionsHooks from '@/hooks/usePermissions';

// Mocks
vi.mock('@/hooks/estoque');
vi.mock('@/hooks/categorias');
vi.mock('@/hooks/usePermissions');

describe('NovoMaterialSheet', () => {
  const mockAdicionarMaterial = vi.fn();
  const mockOnOpenChange = vi.fn();

  const mockCategorias = [
    { value: 'iluminacao', label: 'Iluminação' },
    { value: 'audio', label: 'Áudio' },
    { value: 'video', label: 'Vídeo' },
    { value: 'estrutura', label: 'Estrutura' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(estoqueHooks.useEstoque).mockReturnValue({
      adicionarMaterial: {
        mutateAsync: mockAdicionarMaterial,
        isPending: false,
      },
    } as any);

    vi.mocked(categoriasHooks.useCategorias).mockReturnValue({
      categoriasEstoque: mockCategorias,
    } as any);

    vi.mocked(permissionsHooks.usePermissions).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
    } as any);
  });

  describe('Rendering', () => {
    it('should render form when open', () => {
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByLabelText(/nome do material/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de controle/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<NovoMaterialSheet open={false} onOpenChange={mockOnOpenChange} />);

      expect(screen.queryByLabelText(/nome do material/i)).not.toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByLabelText(/nome do material/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de controle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor unitário/i)).toBeInTheDocument();
    });
  });

  describe('Control Type Selection', () => {
    it('should show serial fields when serial control selected', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const tipoControleSelect = screen.getByLabelText(/tipo de controle/i);
      await user.click(tipoControleSelect);
      await user.click(screen.getByText(/serial/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/quantos seriais criar/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/localização padrão/i)).toBeInTheDocument();
      });
    });

    it('should show quantity fields when quantity control selected', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const tipoControleSelect = screen.getByLabelText(/tipo de controle/i);
      await user.click(tipoControleSelect);
      await user.click(screen.getByText(/quantidade/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/quantidade inicial/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
        expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum name length', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const nameInput = screen.getByLabelText(/nome do material/i);
      await user.type(nameInput, 'AB');

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should validate positive value', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const valorInput = screen.getByLabelText(/valor unitário/i);
      await user.type(valorInput, '-100');

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valor deve ser positivo/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid serial data', async () => {
      const user = userEvent.setup();
      mockAdicionarMaterial.mockResolvedValue({ success: true });

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      // Fill form
      await user.type(screen.getByLabelText(/nome do material/i), 'Moving Head LED 200W');
      
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      await user.click(categoriaSelect);
      await user.click(screen.getByText('Iluminação'));

      await user.type(screen.getByLabelText(/descrição/i), 'Moving head profissional');
      await user.type(screen.getByLabelText(/valor unitário/i), '5000');

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAdicionarMaterial).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'Moving Head LED 200W',
            categoria: 'Iluminação',
            tipoControle: 'serial',
            descricao: 'Moving head profissional',
            valorUnitario: 5000,
          })
        );
      });
    });

    it('should submit form with quantity control', async () => {
      const user = userEvent.setup();
      mockAdicionarMaterial.mockResolvedValue({ success: true });

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      await user.type(screen.getByLabelText(/nome do material/i), 'Cabo DMX 5m');
      
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      await user.click(categoriaSelect);
      await user.click(screen.getByText('Iluminação'));

      const tipoControleSelect = screen.getByLabelText(/tipo de controle/i);
      await user.click(tipoControleSelect);
      await user.click(screen.getByText(/quantidade/i));

      await waitFor(async () => {
        const quantidadeInput = screen.getByLabelText(/quantidade inicial/i);
        await user.type(quantidadeInput, '500');
      });

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAdicionarMaterial).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'Cabo DMX 5m',
            tipoControle: 'quantidade',
            quantidadeInicial: 500,
          })
        );
      });
    });

    it('should close sheet after successful submission', async () => {
      const user = userEvent.setup();
      mockAdicionarMaterial.mockResolvedValue({ success: true });

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      await user.type(screen.getByLabelText(/nome do material/i), 'Test Material');
      
      const categoriaSelect = screen.getByLabelText(/categoria/i);
      await user.click(categoriaSelect);
      await user.click(screen.getByText('Iluminação'));

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Permissions', () => {
    it('should show warning when user lacks permissions', () => {
      vi.mocked(permissionsHooks.usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
      } as any);

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByText(/você não tem permissão para cadastrar materiais/i)).toBeInTheDocument();
    });

    it('should prevent submission without permissions', async () => {
      const user = userEvent.setup();
      vi.mocked(permissionsHooks.usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
      } as any);

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      await user.click(submitButton);

      expect(mockAdicionarMaterial).not.toHaveBeenCalled();
    });
  });

  describe('Serial Generation Preview', () => {
    it('should show serial generation preview', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      await user.type(screen.getByLabelText(/nome do material/i), 'Moving Head');

      const quantidadeSeriaisInput = screen.getByLabelText(/quantos seriais criar/i);
      await user.type(quantidadeSeriaisInput, '10');

      await waitFor(() => {
        expect(screen.getByText(/MOV-001 até MOV-010/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(estoqueHooks.useEstoque).mockReturnValue({
        adicionarMaterial: {
          mutateAsync: mockAdicionarMaterial,
          isPending: true,
        },
      } as any);

      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /cadastrar material/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Category Selection', () => {
    it('should display all available categories', async () => {
      const user = userEvent.setup();
      render(<NovoMaterialSheet open={true} onOpenChange={mockOnOpenChange} />);

      const categoriaSelect = screen.getByLabelText(/categoria/i);
      await user.click(categoriaSelect);

      mockCategorias.forEach(categoria => {
        expect(screen.getByText(categoria.label)).toBeInTheDocument();
      });
    });
  });
});
