import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstoqueVirtualList } from '../EstoqueVirtualList';
import type { MaterialEstoque } from '@/types/estoque';

describe('EstoqueVirtualList', () => {
  const mockMateriais: MaterialEstoque[] = [
    {
      id: '1',
      nome: 'Moving Head LED 200W',
      categoria: 'Iluminação',
      tipoControle: 'serial' as const,
      quantidadeTotal: 10,
      quantidadeDisponivel: 8,
      descricao: 'Moving head profissional',
      valorUnitario: 5000,
      seriais: [],
    },
    {
      id: '2',
      nome: 'Cabo DMX 3 pinos 5m',
      categoria: 'Cabeamento',
      tipoControle: 'quantidade' as const,
      quantidadeTotal: 500,
      quantidadeDisponivel: 450,
      valorUnitario: 35,
      seriais: [],
    },
  ];

  const mockHandlers = {
    onVerDetalhes: vi.fn(),
    onEditar: vi.fn(),
    onExcluir: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render material list correctly', () => {
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      expect(screen.getByText('Moving Head LED 200W')).toBeInTheDocument();
      expect(screen.getByText('Cabo DMX 3 pinos 5m')).toBeInTheDocument();
      expect(screen.getByText('Iluminação')).toBeInTheDocument();
      expect(screen.getByText('Cabeamento')).toBeInTheDocument();
    });

    it('should display material quantities correctly', () => {
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      // Total: 10, Disponível: 8
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();

      // Total: 500, Disponível: 450
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<EstoqueVirtualList materiais={[]} loading={true} {...mockHandlers} />);
      
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render empty state when no materials', () => {
      render(<EstoqueVirtualList materiais={[]} {...mockHandlers} />);
      
      expect(screen.getByText(/nenhum material encontrado/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onVerDetalhes when view button clicked', async () => {
      const user = userEvent.setup();
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      const viewButtons = screen.getAllByRole('button', { name: /ver/i });
      await user.click(viewButtons[0]);

      expect(mockHandlers.onVerDetalhes).toHaveBeenCalledWith(mockMateriais[0]);
    });

    it('should call onEditar when edit button clicked', async () => {
      const user = userEvent.setup();
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      expect(mockHandlers.onEditar).toHaveBeenCalledWith(mockMateriais[0]);
    });

    it('should call onExcluir when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]);

      expect(mockHandlers.onExcluir).toHaveBeenCalledWith(mockMateriais[0]);
    });
  });

  describe('Material Types', () => {
    it('should display serial-controlled materials correctly', () => {
      const serialMaterial = [mockMateriais[0]];
      render(<EstoqueVirtualList materiais={serialMaterial} {...mockHandlers} />);

      expect(screen.getByText('Moving Head LED 200W')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total
    });

    it('should display quantity-controlled materials correctly', () => {
      const quantityMaterial = [mockMateriais[1]];
      render(<EstoqueVirtualList materiais={quantityMaterial} {...mockHandlers} />);

      expect(screen.getByText('Cabo DMX 3 pinos 5m')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument(); // Total
    });
  });

  describe('Virtualization', () => {
    it('should handle large lists efficiently', () => {
      const largeMaterialList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMateriais[0],
        id: `material-${i}`,
        nome: `Material ${i}`,
      }));

      const { container } = render(
        <EstoqueVirtualList materiais={largeMaterialList} {...mockHandlers} />
      );

      // Virtualization should render only visible items
      const renderedItems = container.querySelectorAll('[data-index]');
      expect(renderedItems.length).toBeLessThan(largeMaterialList.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle materials with zero quantities', () => {
      const emptyMaterial: MaterialEstoque = {
        ...mockMateriais[0],
        quantidadeTotal: 0,
        quantidadeDisponivel: 0,
      };

      render(<EstoqueVirtualList materiais={[emptyMaterial]} {...mockHandlers} />);
      
      expect(screen.getByText('Moving Head LED 200W')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('should handle materials without category', () => {
      const noCategoryMaterial: MaterialEstoque = {
        ...mockMateriais[0],
        categoria: '',
      };

      render(<EstoqueVirtualList materiais={[noCategoryMaterial]} {...mockHandlers} />);
      
      expect(screen.getByText('Moving Head LED 200W')).toBeInTheDocument();
    });

    it('should handle materials with low stock', () => {
      const lowStockMaterial: MaterialEstoque = {
        ...mockMateriais[0],
        quantidadeDisponivel: 2,
        quantidadeTotal: 10,
      };

      render(<EstoqueVirtualList materiais={[lowStockMaterial]} {...mockHandlers} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Low stock quantity
    });
  });

  describe('Accessibility', () => {
    it('should have accessible action buttons', () => {
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      const viewButtons = screen.getAllByRole('button', { name: /ver/i });
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });

      expect(viewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should display material information in readable format', () => {
      render(<EstoqueVirtualList materiais={mockMateriais} {...mockHandlers} />);

      // Check that key information is visible
      expect(screen.getByText('Moving Head LED 200W')).toBeVisible();
      expect(screen.getByText('Iluminação')).toBeVisible();
    });
  });
});
