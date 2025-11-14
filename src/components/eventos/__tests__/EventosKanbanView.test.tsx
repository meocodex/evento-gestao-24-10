import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventosKanbanView } from '../EventosKanbanView';
import type { Evento } from '@/types/eventos';
import { createMockEvento } from '../../../../tests/helpers/test-data-builders';

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
  const mockEventos: Evento[] = [
    createMockEvento({ id: '1', nome: 'Evento Em Negociação', status: 'em_negociacao' }),
    createMockEvento({ id: '2', nome: 'Evento Confirmado', status: 'confirmado' }),
    createMockEvento({ id: '3', nome: 'Evento Em Preparação', status: 'em_preparacao' }),
    createMockEvento({ id: '4', nome: 'Evento Em Execução', status: 'em_execucao' }),
    createMockEvento({ id: '5', nome: 'Evento Finalizado', status: 'finalizado' }),
  ];

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
        createMockEvento({ id: '6', nome: 'Novo Evento', status: 'em_negociacao' }),
      ];

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

      expect(screen.getAllByTestId(/^column-/)).toHaveLength(6);
    });

    it('deve lidar com diferentes quantidades de eventos', () => {
      const eventosVarios = Array.from({ length: 20 }, (_, i) =>
        createMockEvento({
          id: `evento-${i}`,
          nome: `Evento ${i}`,
          status: i % 2 === 0 ? 'em_negociacao' : 'confirmado',
        })
      );

      render(
        <EventosKanbanView eventos={eventosVarios} onViewDetails={mockOnViewDetails} />
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

      expect(screen.getByTestId('column-orcamento')).toHaveTextContent('1 eventos');

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
        createMockEvento({ 
          id: '1', 
          nome: 'Evento Inválido', 
          status: 'status_invalido' as any 
        }),
      ];

      render(
        <EventosKanbanView eventos={eventosInvalidos} onViewDetails={mockOnViewDetails} />
      );

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
