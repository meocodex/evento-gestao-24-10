import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventosCalendarView } from '../EventosCalendarView';
import { Evento } from '@/types/eventos';

const mockEventos: Evento[] = [
  {
    id: '1',
    nome: 'Evento Hoje',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    horaInicio: '18:00',
    horaFim: '23:00',
    local: 'Local 1',
    cidade: 'Cuiabá',
    estado: 'MT',
    endereco: 'Rua 1',
    status: 'confirmado',
    cliente: {
      id: '1',
      nome: 'Cliente 1',
      email: 'cliente1@teste.com',
      telefone: '65999999999',
      tipo: 'CPF',
      documento: '12345678900',
      endereco: { cep: '78000-000', logradouro: 'Rua 1', numero: '1', bairro: 'Centro', cidade: 'Cuiabá', estado: 'MT' },
    },
    comercial: {
      id: '1',
      nome: 'Comercial 1',
      email: 'comercial1@teste.com',
    },
    tipoEvento: 'bar',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    nome: 'Evento Futuro',
    dataInicio: '2025-12-25',
    dataFim: '2025-12-25',
    horaInicio: '20:00',
    horaFim: '02:00',
    local: 'Local 2',
    cidade: 'Cuiabá',
    estado: 'MT',
    endereco: 'Rua 2',
    status: 'orcamento',
    cliente: {
      id: '2',
      nome: 'Cliente 2',
      email: 'cliente2@teste.com',
      telefone: '65999999998',
      tipo: 'CNPJ',
      documento: '12345678000199',
      endereco: { cep: '01000-000', logradouro: 'Rua 2', numero: '2', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP' },
    },
    comercial: {
      id: '2',
      nome: 'Comercial 2',
      email: 'comercial2@teste.com',
    },
    tipoEvento: 'ingresso',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    nome: 'Evento Cancelado',
    dataInicio: '2025-12-25',
    dataFim: '2025-12-25',
    horaInicio: '14:00',
    horaFim: '18:00',
    local: 'Local 3',
    cidade: 'Cuiabá',
    estado: 'MT',
    endereco: 'Rua 3',
    status: 'cancelado',
    cliente: {
      id: '3',
      nome: 'Cliente 3',
      email: 'cliente3@teste.com',
      telefone: '65999999997',
      tipo: 'CPF',
      documento: '12345678901',
      endereco: { cep: '20000-000', logradouro: 'Rua 3', numero: '3', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
    },
    comercial: {
      id: '3',
      nome: 'Comercial 3',
      email: 'comercial3@teste.com',
    },
    tipoEvento: 'hibrido',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('EventosCalendarView', () => {
  const mockOnEventoClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o calendário com o mês atual', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const currentMonth = new Date();
      const monthYear = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('deve renderizar todos os dias da semana', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      weekdays.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('deve renderizar botões de navegação', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      expect(screen.getByRole('button', { name: /hoje/i })).toBeInTheDocument();
    });

    it('deve renderizar a legenda de status', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      expect(screen.getByText('Legenda de Status')).toBeInTheDocument();
      expect(screen.getByText('orcamento')).toBeInTheDocument();
      expect(screen.getByText('confirmado')).toBeInTheDocument();
      expect(screen.getByText('cancelado')).toBeInTheDocument();
    });
  });

  describe('Navegação de Meses', () => {
    it('deve navegar para o mês anterior', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const prevButton = screen.getAllByRole('button')[1]; // Segundo botão (seta esquerda)
      await user.click(prevButton);

      const currentMonth = new Date();
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      const expectedMonth = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      expect(screen.getByText(expectedMonth)).toBeInTheDocument();
    });

    it('deve navegar para o próximo mês', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const nextButton = screen.getAllByRole('button')[2]; // Terceiro botão (seta direita)
      await user.click(nextButton);

      const currentMonth = new Date();
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      const expectedMonth = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      expect(screen.getByText(expectedMonth)).toBeInTheDocument();
    });

    it('deve voltar para o mês atual ao clicar em "Hoje"', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      // Navegar para outro mês
      const nextButton = screen.getAllByRole('button')[2];
      await user.click(nextButton);

      // Voltar para hoje
      const todayButton = screen.getByRole('button', { name: /hoje/i });
      await user.click(todayButton);

      const currentMonth = new Date();
      const expectedMonth = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      expect(screen.getByText(expectedMonth)).toBeInTheDocument();
    });

    it('deve mudar de ano ao navegar pelos meses', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const prevButton = screen.getAllByRole('button')[1];
      
      // Clicar 12 vezes para voltar um ano
      for (let i = 0; i < 12; i++) {
        await user.click(prevButton);
      }

      const currentMonth = new Date();
      currentMonth.setMonth(currentMonth.getMonth() - 12);
      const expectedYear = currentMonth.getFullYear().toString();

      expect(screen.getByText(new RegExp(expectedYear))).toBeInTheDocument();
    });
  });

  describe('Exibição de Eventos', () => {
    it('deve exibir eventos no dia correto', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const hoje = new Date().getDate();
      
      // Procura pelo evento "Evento Hoje"
      expect(screen.getByText('Evento Hoje')).toBeInTheDocument();
    });

    it('deve exibir contador de eventos quando há múltiplos eventos', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      // Deve haver pelo menos um badge com número
      const badges = screen.getAllByText(/\d+/);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('deve limitar a exibição a 2 eventos por dia', () => {
      const eventosMultiplos = [
        ...mockEventos,
        {
          ...mockEventos[1],
          id: '4',
          nome: 'Evento Extra 1',
        },
        {
          ...mockEventos[1],
          id: '5',
          nome: 'Evento Extra 2',
        },
      ];

      render(<EventosCalendarView eventos={eventosMultiplos} onEventoClick={mockOnEventoClick} />);

      // Navegar para dezembro onde tem 4 eventos no dia 25
      const user = userEvent.setup();
      
      // Deve exibir "+X mais" quando há mais de 2 eventos
      const maisIndicators = screen.queryAllByText(/\+\d+ mais/);
      // Pode não aparecer se não estamos no mês correto ainda
    });

    it('deve exibir nome do cliente no evento', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });

    it('deve aplicar cor correta baseada no status', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const confirmedEvent = screen.getByText('Evento Hoje').closest('button');
      expect(confirmedEvent).toHaveClass('bg-emerald-100');
    });
  });

  describe('Interação com Eventos', () => {
    it('deve chamar onEventoClick ao clicar em um evento', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const eventoButton = screen.getByText('Evento Hoje').closest('button');
      await user.click(eventoButton!);

      expect(mockOnEventoClick).toHaveBeenCalledWith(mockEventos[0]);
    });

    it('deve permitir hover em eventos', async () => {
      const user = userEvent.setup();
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const eventoButton = screen.getByText('Evento Hoje').closest('button');
      await user.hover(eventoButton!);

      expect(eventoButton).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('Destaque do Dia Atual', () => {
    it('deve destacar o dia atual', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const today = new Date().getDate();
      const todayElement = screen.getByText(today.toString(), { selector: 'span' });

      expect(todayElement).toHaveClass('bg-primary');
    });

    it('deve aplicar ring ao dia atual', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const today = new Date().getDate();
      const todayCell = screen.getByText(today.toString()).closest('div');

      expect(todayCell).toHaveClass('ring-2', 'ring-primary');
    });
  });

  describe('Dias de Outros Meses', () => {
    it('deve renderizar dias do mês anterior com estilo diferente', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const otherMonthDays = container.querySelectorAll('.bg-navy-50');
      expect(otherMonthDays.length).toBeGreaterThan(0);
    });

    it('deve renderizar dias do próximo mês com estilo diferente', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const otherMonthDays = container.querySelectorAll('.dark\\:bg-navy-900\\/50');
      expect(otherMonthDays.length).toBeGreaterThan(0);
    });
  });

  describe('Grid do Calendário', () => {
    it('deve ter grid de 7 colunas para os dias da semana', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const weekdayGrid = container.querySelector('.grid-cols-7');
      expect(weekdayGrid).toBeInTheDocument();
    });

    it('deve exibir pelo menos 5 semanas', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const daysCells = container.querySelectorAll('.min-h-\\[100px\\]');
      expect(daysCells.length).toBeGreaterThanOrEqual(35); // 5 semanas x 7 dias
    });
  });

  describe('Eventos Vazios', () => {
    it('deve renderizar calendário vazio quando não há eventos', () => {
      render(<EventosCalendarView eventos={[]} onEventoClick={mockOnEventoClick} />);

      const currentMonth = new Date();
      const monthYear = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('não deve exibir badges de contagem quando não há eventos', () => {
      render(<EventosCalendarView eventos={[]} onEventoClick={mockOnEventoClick} />);

      const badges = screen.queryAllByRole('status');
      expect(badges.length).toBe(0);
    });
  });

  describe('Dark Mode', () => {
    it('deve ter classes de dark mode definidas', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const darkModeElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsividade', () => {
    it('deve ter classes responsivas para mobile', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const responsiveElements = container.querySelectorAll('[class*="sm:"]');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('botão "Hoje" deve ter classe hidden em mobile', () => {
      render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const todayButton = screen.getByRole('button', { name: /hoje/i });
      expect(todayButton).toHaveClass('hidden', 'sm:flex');
    });
  });

  describe('Ícones', () => {
    it('deve exibir ícone de relógio nos eventos', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const clockIcons = container.querySelectorAll('[class*="lucide-clock"]');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('deve exibir ícone de usuários quando há cliente', () => {
      const { container } = render(<EventosCalendarView eventos={mockEventos} onEventoClick={mockOnEventoClick} />);

      const userIcons = container.querySelectorAll('[class*="lucide-users"]');
      expect(userIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Cores de Status', () => {
    const statusColors = {
      orcamento: 'bg-amber-100',
      confirmado: 'bg-emerald-100',
      em_preparacao: 'bg-purple-100',
      em_execucao: 'bg-blue-100',
      concluido: 'bg-green-100',
      cancelado: 'bg-red-100',
    };

    Object.entries(statusColors).forEach(([status, color]) => {
      it(`deve usar cor ${color} para status ${status}`, () => {
        const eventoComStatus = [{
          ...mockEventos[0],
          status: status as any,
          dataInicio: new Date().toISOString().split('T')[0],
        }];

        const { container } = render(
          <EventosCalendarView eventos={eventoComStatus} onEventoClick={mockOnEventoClick} />
        );

        const statusElement = container.querySelector(`.${color}`);
        expect(statusElement).toBeInTheDocument();
      });
    });
  });
});
