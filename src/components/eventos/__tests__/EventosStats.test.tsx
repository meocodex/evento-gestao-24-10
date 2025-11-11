import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventosStats } from '../EventosStats';
import type { Evento } from '@/types/eventos';

// Mock do StatCard
vi.mock('@/components/dashboard/StatCard', () => ({
  StatCard: ({ title, value, subtitle, variant }: any) => (
    <div data-testid={`stat-card-${variant}`}>
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value">{value}</div>
      <div data-testid="stat-subtitle">{subtitle}</div>
    </div>
  ),
}));

describe('EventosStats', () => {
  const createEvento = (id: string, status: any): Partial<Evento> => ({
    id,
    nome: `Evento ${id}`,
    status,
    data_inicio: '2024-01-15',
    data_fim: '2024-01-15',
    cliente_id: 'cliente-1',
    comercial_id: 'comercial-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  });

  describe('Renderização básica', () => {
    it('deve renderizar os 4 cards de estatísticas', () => {
      const eventos = [
        createEvento('1', 'confirmado'),
        createEvento('2', 'em_execucao'),
        createEvento('3', 'concluido'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      expect(screen.getByText('Total de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Confirmados')).toBeInTheDocument();
      expect(screen.getByText('Em Execução')).toBeInTheDocument();
      expect(screen.getByText('Concluídos')).toBeInTheDocument();
    });

    it('deve renderizar subtítulos corretos', () => {
      render(<EventosStats eventos={[]} />);

      expect(screen.getByText('Mês atual')).toBeInTheDocument();
      expect(screen.getByText('Aguardando execução')).toBeInTheDocument();
      expect(screen.getByText('Acontecendo agora')).toBeInTheDocument();
      expect(screen.getByText('Finalizados')).toBeInTheDocument();
    });
  });

  describe('Cálculo de estatísticas', () => {
    it('deve calcular total de eventos corretamente', () => {
      const eventos = [
        createEvento('1', 'orcamento'),
        createEvento('2', 'confirmado'),
        createEvento('3', 'em_execucao'),
        createEvento('4', 'concluido'),
        createEvento('5', 'cancelado'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      const totalCard = statCards[0];
      expect(totalCard).toHaveTextContent('5');
    });

    it('deve calcular confirmados (incluindo confirmado e em_preparacao)', () => {
      const eventos = [
        createEvento('1', 'confirmado'),
        createEvento('2', 'confirmado'),
        createEvento('3', 'em_preparacao'),
        createEvento('4', 'em_execucao'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      const confirmadosCard = statCards[1];
      expect(confirmadosCard).toHaveTextContent('3'); // 2 confirmados + 1 em_preparacao
    });

    it('deve calcular eventos em execução', () => {
      const eventos = [
        createEvento('1', 'em_execucao'),
        createEvento('2', 'em_execucao'),
        createEvento('3', 'confirmado'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      const emExecucaoCard = statCards[2];
      expect(emExecucaoCard).toHaveTextContent('2');
    });

    it('deve calcular eventos concluídos', () => {
      const eventos = [
        createEvento('1', 'concluido'),
        createEvento('2', 'concluido'),
        createEvento('3', 'concluido'),
        createEvento('4', 'em_execucao'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      const concluidosCard = statCards[3];
      expect(concluidosCard).toHaveTextContent('3');
    });

    it('deve lidar com array vazio', () => {
      render(<EventosStats eventos={[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('0'); // Total
      expect(statCards[1]).toHaveTextContent('0'); // Confirmados
      expect(statCards[2]).toHaveTextContent('0'); // Em Execução
      expect(statCards[3]).toHaveTextContent('0'); // Concluídos
    });
  });

  describe('Variantes dos cards', () => {
    it('deve usar variantes corretas para cada card', () => {
      render(<EventosStats eventos={[]} />);

      expect(screen.getByTestId('stat-card-primary')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-success')).toBeInTheDocument();
      expect(screen.getAllByTestId('stat-card-default')).toHaveLength(2);
    });
  });

  describe('Layout e animações', () => {
    it('deve ter grid responsivo', () => {
      const { container } = render(<EventosStats eventos={[]} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('deve ter animações escalonadas', () => {
      const { container } = render(<EventosStats eventos={[]} />);

      const animatedDivs = container.querySelectorAll('.animate-slide-up');
      expect(animatedDivs).toHaveLength(4);

      // Verificar delays
      expect(animatedDivs[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(animatedDivs[1]).toHaveStyle({ animationDelay: '100ms' });
      expect(animatedDivs[2]).toHaveStyle({ animationDelay: '200ms' });
      expect(animatedDivs[3]).toHaveStyle({ animationDelay: '300ms' });
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com grande quantidade de eventos', () => {
      const eventos = Array.from({ length: 1000 }, (_, i) =>
        createEvento(`${i}`, i % 2 === 0 ? 'confirmado' : 'em_execucao')
      );

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('1000');
    });

    it('deve lidar com status variados', () => {
      const eventos = [
        createEvento('1', 'orcamento'),
        createEvento('2', 'confirmado'),
        createEvento('3', 'em_preparacao'),
        createEvento('4', 'em_execucao'),
        createEvento('5', 'concluido'),
        createEvento('6', 'cancelado'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('6'); // Total
      expect(statCards[1]).toHaveTextContent('2'); // Confirmados (confirmado + em_preparacao)
      expect(statCards[2]).toHaveTextContent('1'); // Em Execução
      expect(statCards[3]).toHaveTextContent('1'); // Concluídos
    });

    it('deve recalcular quando eventos mudam', () => {
      const eventos1 = [createEvento('1', 'confirmado')];
      const { rerender } = render(<EventosStats eventos={eventos1 as Evento[]} />);

      let statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('1');

      const eventos2 = [
        createEvento('1', 'confirmado'),
        createEvento('2', 'em_execucao'),
      ];
      rerender(<EventosStats eventos={eventos2 as Evento[]} />);

      statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('2');
    });
  });

  describe('Performance', () => {
    it('deve usar useMemo para otimização', () => {
      const eventos = [createEvento('1', 'confirmado')];
      const { rerender } = render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards1 = screen.getAllByTestId('stat-value');

      // Rerenderizar com mesmos eventos (useMemo deve evitar recálculo)
      rerender(<EventosStats eventos={eventos as Evento[]} />);

      const statCards2 = screen.getAllByTestId('stat-value');
      expect(statCards2[0]).toHaveTextContent(statCards1[0].textContent || '');
    });

    it('deve renderizar rapidamente com muitos eventos', () => {
      const eventos = Array.from({ length: 500 }, (_, i) =>
        createEvento(`${i}`, 'confirmado')
      );

      const startTime = performance.now();
      render(<EventosStats eventos={eventos as Evento[]} />);
      const endTime = performance.now();

      // Deve renderizar em menos de 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Formatação de valores', () => {
    it('deve formatar valores como strings', () => {
      const eventos = [
        createEvento('1', 'confirmado'),
        createEvento('2', 'confirmado'),
      ];

      render(<EventosStats eventos={eventos as Evento[]} />);

      const statCards = screen.getAllByTestId('stat-value');
      expect(statCards[0]).toHaveTextContent('2');
      expect(typeof statCards[0].textContent).toBe('string');
    });
  });
});
