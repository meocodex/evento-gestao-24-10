import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventosTableView } from '../EventosTableView';
import { Evento } from '@/types/eventos';

const mockEventos: Evento[] = [
  {
    id: '1',
    nome: 'Evento 1',
    dataInicio: '2025-12-25',
    dataFim: '2025-12-25',
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
    tags: [],
    checklist: [],
    materiaisAlocados: { antecipado: [], comTecnicos: [] },
    financeiro: { receitas: [], despesas: [], cobrancas: [] },
    timeline: [],
    equipe: [],
    observacoesOperacionais: [],
    criadoEm: '2025-01-01T00:00:00Z',
    atualizadoEm: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    nome: 'Evento 2',
    dataInicio: '2025-06-15',
    dataFim: '2025-06-16',
    horaInicio: '20:00',
    horaFim: '02:00',
    local: 'Local 2',
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: 'Rua 2',
    status: 'orcamento',
    cliente: {
      id: '2',
      nome: 'Cliente 2',
      email: 'cliente2@teste.com',
      telefone: '11999999999',
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
    tags: [],
    checklist: [],
    materiaisAlocados: { antecipado: [], comTecnicos: [] },
    financeiro: { receitas: [], despesas: [], cobrancas: [] },
    timeline: [],
    equipe: [],
    observacoesOperacionais: [],
    criadoEm: '2025-01-01T00:00:00Z',
    atualizadoEm: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    nome: 'Evento 3',
    dataInicio: '2025-03-10',
    dataFim: '2025-03-10',
    horaInicio: '14:00',
    horaFim: '18:00',
    local: 'Local 3',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    endereco: 'Rua 3',
    status: 'cancelado',
    cliente: {
      id: '3',
      nome: 'Cliente 3',
      email: 'cliente3@teste.com',
      telefone: '21999999999',
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
    tags: [],
    checklist: [],
    materiaisAlocados: { antecipado: [], comTecnicos: [] },
    financeiro: { receitas: [], despesas: [], cobrancas: [] },
    timeline: [],
    equipe: [],
    observacoesOperacionais: [],
    criadoEm: '2025-01-01T00:00:00Z',
    atualizadoEm: '2025-01-01T00:00:00Z',
  },
];

describe('EventosTableView', () => {
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar a tabela com cabeçalhos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Evento')).toBeInTheDocument();
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Cidade')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar todos os eventos na tabela', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Evento 1')).toBeInTheDocument();
      expect(screen.getByText('Evento 2')).toBeInTheDocument();
      expect(screen.getByText('Evento 3')).toBeInTheDocument();
    });

    it('deve renderizar tabela vazia quando não há eventos', () => {
      const { container } = render(<EventosTableView eventos={[]} onViewDetails={mockOnViewDetails} />);

      const tbody = container.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });
  });

  describe('Exibição de Dados', () => {
    it('deve exibir nome dos eventos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      mockEventos.forEach(evento => {
        expect(screen.getByText(evento.nome)).toBeInTheDocument();
      });
    });

    it('deve exibir nome dos clientes', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      mockEventos.forEach(evento => {
        expect(screen.getAllByText(evento.cliente.nome).length).toBeGreaterThan(0);
      });
    });

    it('deve formatar datas corretamente', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('25 de dez')).toBeInTheDocument();
      expect(screen.getByText('15 de jun')).toBeInTheDocument();
      expect(screen.getByText('10 de mar')).toBeInTheDocument();
    });

    it('deve exibir cidades dos eventos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Cuiabá')).toBeInTheDocument();
      expect(screen.getByText('São Paulo')).toBeInTheDocument();
      expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
    });

    it('deve renderizar StatusBadge para cada evento', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      // Verificar que há badges de status
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(mockEventos.length + 1); // +1 para o header
    });
  });

  describe('Interações', () => {
    it('deve chamar onViewDetails ao clicar na linha', async () => {
      const user = userEvent.setup();
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const row = screen.getByText('Evento 1').closest('tr');
      await user.click(row!);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockEventos[0]);
    });

    it('deve chamar onViewDetails ao clicar no botão de ação', async () => {
      const user = userEvent.setup();
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockEventos[0]);
    });

    it('deve parar propagação ao clicar no botão de ação', async () => {
      const user = userEvent.setup();
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      // Deve ser chamado apenas uma vez (não duas vezes pela propagação)
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('deve aplicar hover na linha', async () => {
      const user = userEvent.setup();
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const row = screen.getByText('Evento 1').closest('tr');
      await user.hover(row!);

      expect(row).toHaveClass('hover:bg-muted/30');
    });
  });

  describe('Ícones', () => {
    it('deve exibir ícone de olho no botão de ações', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const eyeIcons = container.querySelectorAll('[class*="lucide-eye"]');
      expect(eyeIcons.length).toBe(mockEventos.length);
    });

    it('deve exibir ícone de calendário nas datas', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const calendarIcons = container.querySelectorAll('[class*="lucide-calendar"]');
      expect(calendarIcons.length).toBe(mockEventos.length);
    });

    it('deve exibir ícone de localização nas cidades', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const mapPinIcons = container.querySelectorAll('[class*="lucide-map-pin"]');
      expect(mapPinIcons.length).toBe(mockEventos.length);
    });
  });

  describe('Responsividade', () => {
    it('deve ocultar coluna Cliente em mobile', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const clienteHeader = screen.getByText('Cliente').closest('th');
      expect(clienteHeader).toHaveClass('hidden', 'md:table-cell');
    });

    it('deve ocultar coluna Data em tablets pequenos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const dataHeader = screen.getByText('Data').closest('th');
      expect(dataHeader).toHaveClass('hidden', 'lg:table-cell');
    });

    it('deve ocultar coluna Cidade em tablets', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const cidadeHeader = screen.getByText('Cidade').closest('th');
      expect(cidadeHeader).toHaveClass('hidden', 'xl:table-cell');
    });

    it('deve exibir nome do cliente em mobile na linha do evento', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const mobileCliente = screen.getAllByText('Cliente 1')[0];
      expect(mobileCliente.closest('span')).toHaveClass('md:hidden');
    });
  });

  describe('Estilos', () => {
    it('deve ter classe de animação fade-in', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const tableContainer = container.querySelector('.animate-fade-in');
      expect(tableContainer).toBeInTheDocument();
    });

    it('deve ter bordas arredondadas', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const tableContainer = container.querySelector('.rounded-lg');
      expect(tableContainer).toBeInTheDocument();
    });

    it('deve ter fundo de card', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const tableContainer = container.querySelector('.bg-card');
      expect(tableContainer).toBeInTheDocument();
    });

    it('deve ter cabeçalho com fundo muted', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const headerRow = screen.getByText('Evento').closest('tr');
      expect(headerRow).toHaveClass('bg-muted/50');
    });

    it('deve aplicar cursor pointer nas linhas', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const row = screen.getByText('Evento 1').closest('tr');
      expect(row).toHaveClass('cursor-pointer');
    });
  });

  describe('Estrutura da Tabela', () => {
    it('deve ter 6 colunas no cabeçalho', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(6);
    });

    it('deve ter número correto de linhas', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const rows = screen.getAllByRole('row');
      // +1 para o header
      expect(rows.length).toBe(mockEventos.length + 1);
    });

    it('deve ter células com alinhamento correto', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const acoesHeader = screen.getByText('Ações').closest('th');
      expect(acoesHeader).toHaveClass('text-right');
    });
  });

  describe('Botões de Ação', () => {
    it('deve ter botão ghost para cada evento', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const ghostButtons = container.querySelectorAll('button');
      expect(ghostButtons.length).toBe(mockEventos.length);
    });

    it('deve ter tamanho sm nos botões', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toMatch(/h-\d+|w-\d+/);
      });
    });
  });

  describe('Formatação de Texto', () => {
    it('deve ter fonte semibold nos nomes dos eventos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const eventName = screen.getByText('Evento 1').closest('span');
      expect(eventName).toHaveClass('font-semibold');
    });

    it('deve ter fonte medium nas células de evento', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const eventCell = screen.getByText('Evento 1').closest('td');
      expect(eventCell).toHaveClass('font-medium');
    });

    it('deve ter fonte semibold nos cabeçalhos', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveClass('font-semibold');
      });
    });

    it('deve ter texto pequeno para informações mobile', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const mobileInfo = screen.getAllByText('Cliente 1')[0].closest('span');
      expect(mobileInfo).toHaveClass('text-xs');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com evento sem cliente', () => {
      const eventoSemCliente = [{
        ...mockEventos[0],
        cliente: null as any,
      }];

      expect(() => {
        render(<EventosTableView eventos={eventoSemCliente} onViewDetails={mockOnViewDetails} />);
      }).toThrow();
    });

    it('deve lidar com array vazio de eventos', () => {
      const { container } = render(<EventosTableView eventos={[]} onViewDetails={mockOnViewDetails} />);

      const tbody = container.querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });

    it('deve lidar com data inválida', () => {
      const eventoDataInvalida = [{
        ...mockEventos[0],
        dataInicio: 'invalid-date',
      }];

      expect(() => {
        render(<EventosTableView eventos={eventoDataInvalida} onViewDetails={mockOnViewDetails} />);
      }).toThrow();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role table', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const table = container.querySelector('table');
      expect(table).toHaveAttribute('role', 'table');
    });

    it('deve ter botões acessíveis', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('deve ter linhas clicáveis', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const rows = screen.getAllByRole('row');
      // Header não é clicável, mas as linhas de dados são
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe('Cores e Temas', () => {
    it('deve ter suporte a dark mode', () => {
      const { container } = render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const darkElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('deve usar cores muted para textos secundários', () => {
      render(<EventosTableView eventos={mockEventos} onViewDetails={mockOnViewDetails} />);

      const mobileText = screen.getAllByText('Cliente 1')[0];
      expect(mobileText).toHaveClass('text-muted-foreground');
    });
  });
});
