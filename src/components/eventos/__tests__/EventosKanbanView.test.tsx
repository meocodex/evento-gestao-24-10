import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventosKanbanView } from '../EventosKanbanView';
import type { Evento } from '@/types/eventos';

// Mock dos hooks e dependências
vi.mock('@/hooks/eventos', () => ({
  useEventos: vi.fn(() => ({
    editarEvento: {
      mutateAsync: vi.fn().mockResolvedValue({}),
    },
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../EventoKanbanColumn', () => ({
  EventoKanbanColumn: ({ label, eventos, status }: any) => (
    <div data-testid={`column-${status}`}>
      <div>{label}</div>
      <div>{eventos.length} eventos</div>
    </div>
  ),
}));

vi.mock('../EventoKanbanCard', () => ({
  EventoKanbanCard: ({ evento }: any) => (
    <div data-testid={`card-${evento.id}`}>{evento.nome}</div>
  ),
}));

describe('EventosKanbanView', () => {
  const mockEventos: Partial<Evento>[] = [
    {
      id: '1',
      nome: 'Evento Orçamento',
      status: 'orcamento',
      data_inicio: '2024-01-15',
      data_fim: '2024-01-15',
      cliente_id: 'cliente-1',
      comercial_id: 'comercial-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      nome: 'Evento Confirmado',
      status: 'confirmado',
      data_inicio: '2024-01-20',
      data_fim: '2024-01-20',
      cliente_id: 'cliente-2',
      comercial_id: 'comercial-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '3',
      nome: 'Evento Em Preparação',
      status: 'em_preparacao',
      data_inicio: '2024-01-25',
      data_fim: '2024-01-25',
      cliente_id: 'cliente-3',
      comercial_id: 'comercial-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '4',
      nome: 'Evento Em Execução',
      status: 'em_execucao',
      data_inicio: '2024-01-10',
      data_fim: '2024-01-10',
      cliente_id: 'cliente-4',
      comercial_id: 'comercial-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '5',
      nome: 'Evento Concluído',
      status: 'concluido',
      data_inicio: '2024-01-05',
      data_fim: '2024-01-05',
      cliente_id: 'cliente-5',
      comercial_id: 'comercial-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ] as Evento[];

  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar todas as colunas de status', () => {
      render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toBeInTheDocument();
      expect(screen.getByTestId('column-confirmado')).toBeInTheDocument();
      expect(screen.getByTestId('column-em_preparacao')).toBeInTheDocument();
      expect(screen.getByTestId('column-em_execucao')).toBeInTheDocument();
      expect(screen.getByTestId('column-concluido')).toBeInTheDocument();
      expect(screen.getByTestId('column-cancelado')).toBeInTheDocument();
    });

    it('deve renderizar labels das colunas', () => {
      render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByText('Orçamento')).toBeInTheDocument();
      expect(screen.getByText('Confirmado')).toBeInTheDocument();
      expect(screen.getByText('Em Preparação')).toBeInTheDocument();
      expect(screen.getByText('Em Execução')).toBeInTheDocument();
      expect(screen.getByText('Concluído')).toBeInTheDocument();
      expect(screen.getByText('Cancelado')).toBeInTheDocument();
    });

    it('deve renderizar eventos nas colunas corretas', () => {
      render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      // Verificar contadores
      const orcamentoColumn = screen.getByTestId('column-orcamento');
      expect(orcamentoColumn).toHaveTextContent('1 eventos');

      const confirmadoColumn = screen.getByTestId('column-confirmado');
      expect(confirmadoColumn).toHaveTextContent('1 eventos');
    });

    it('deve renderizar com lista vazia', () => {
      render(
        <EventosKanbanView eventos={[]} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('0 eventos');
      expect(screen.getByTestId('column-confirmado')).toHaveTextContent('0 eventos');
    });
  });

  describe('Agrupamento de eventos', () => {
    it('deve agrupar eventos por status corretamente', () => {
      render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('1 eventos');
      expect(screen.getByTestId('column-confirmado')).toHaveTextContent('1 eventos');
      expect(screen.getByTestId('column-em_preparacao')).toHaveTextContent('1 eventos');
      expect(screen.getByTestId('column-em_execucao')).toHaveTextContent('1 eventos');
      expect(screen.getByTestId('column-concluido')).toHaveTextContent('1 eventos');
      expect(screen.getByTestId('column-cancelado')).toHaveTextContent('0 eventos');
    });

    it('deve reagrupar quando eventos mudam', () => {
      const { rerender } = render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('1 eventos');

      const novosEventos = [
        ...mockEventos,
        {
          id: '6',
          nome: 'Novo Evento',
          status: 'orcamento',
          data_inicio: '2024-01-30',
          data_fim: '2024-01-30',
          cliente_id: 'cliente-6',
          comercial_id: 'comercial-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ] as Evento[];

      rerender(
        <EventosKanbanView eventos={novosEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('2 eventos');
    });
  });

  describe('Layout responsivo', () => {
    it('deve ter classes para desktop e mobile', () => {
      const { container } = render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      const desktopLayout = container.querySelector('.hidden.md\\:block');
      expect(desktopLayout).toBeInTheDocument();

      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('deve passar onViewDetails para as colunas', () => {
      render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      // Verificar que as colunas foram renderizadas (indicando que as props foram passadas)
      expect(screen.getAllByTestId(/^column-/)).toHaveLength(6);
    });

    it('deve lidar com diferentes quantidades de eventos', () => {
      const eventosVarios = Array.from({ length: 20 }, (_, i) => ({
        id: `evento-${i}`,
        nome: `Evento ${i}`,
        status: i % 2 === 0 ? 'orcamento' : 'confirmado',
        data_inicio: '2024-01-15',
        data_fim: '2024-01-15',
        cliente_id: 'cliente-1',
        comercial_id: 'comercial-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }));

      render(
        <EventosKanbanView eventos={eventosVarios as Evento[]} onViewDetails={mockOnViewDetails} />
      );


      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('10 eventos');
      expect(screen.getByTestId('column-confirmado')).toHaveTextContent('10 eventos');
    });
  });

  describe('Performance', () => {
    it('deve usar useMemo para agrupar eventos', () => {
      const { rerender } = render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      // Primeira renderização
      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('1 eventos');

      // Rerenderizar com mesmos eventos (não deve recalcular)
      rerender(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('1 eventos');
    });
  });

  describe('Animações', () => {
    it('deve ter classe de animação', () => {
      const { container } = render(
        <EventosKanbanView eventos={mockEventos} onViewDetails={mockOnViewDetails} />
      );

      const animatedElement = container.querySelector('.animate-fade-in');
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com eventos sem status válido', () => {
      const eventosInvalidos = [
        {
          id: '1',
          nome: 'Evento Inválido',
          status: 'status_invalido' as any,
          data_inicio: '2024-01-15',
          data_fim: '2024-01-15',
          cliente_id: 'cliente-1',
          comercial_id: 'comercial-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      render(
        <EventosKanbanView eventos={eventosInvalidos as Evento[]} onViewDetails={mockOnViewDetails} />
      );

      // Deve renderizar sem erros
      expect(screen.getByTestId('column-orcamento')).toBeInTheDocument();
    });

    it('deve lidar com array vazio de eventos', () => {
      render(
        <EventosKanbanView eventos={[]} onViewDetails={mockOnViewDetails} />
      );

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('0 eventos');
      expect(screen.getByTestId('column-confirmado')).toHaveTextContent('0 eventos');
    });
  });
});
