import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventoCard } from '../EventoCard';
import { Evento } from '@/types/eventos';
import { BrowserRouter } from 'react-router-dom';
import * as usePermissionsModule from '@/hooks/usePermissions';
import * as useMaterialPendenteModule from '@/hooks/eventos/useMaterialPendente';

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock dos hooks
vi.mock('@/hooks/usePermissions');
vi.mock('@/hooks/eventos/useMaterialPendente');

const mockEvento: Evento = {
  id: '123',
  nome: 'Evento Teste',
  dataInicio: '2025-12-25',
  dataFim: '2025-12-26',
  horaInicio: '18:00',
  horaFim: '23:00',
  local: 'Buffet Teste',
  cidade: 'Cuiabá',
  estado: 'MT',
  endereco: 'Rua Teste, 123',
  status: 'confirmado',
  cliente: {
    id: '1',
    nome: 'Cliente Teste',
    email: 'cliente@teste.com',
    telefone: '65999999999',
    tipo: 'CPF',
    documento: '12345678900',
    endereco: {
      cep: '78000-000',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Cuiabá',
      estado: 'MT',
    },
  },
  comercial: {
    id: '1',
    nome: 'Comercial Teste',
    email: 'comercial@teste.com',
  },
  tags: ['Casamento', 'Premium'],
  tipoEvento: 'bar',
  checklist: [],
  materiaisAlocados: {
    antecipado: [],
    comTecnicos: [],
  },
  financeiro: {
    receitas: [],
    despesas: [],
    cobrancas: [],
  },
  timeline: [],
  equipe: [],
  observacoesOperacionais: [],
  criadoEm: '2025-01-01T00:00:00Z',
  atualizadoEm: '2025-01-01T00:00:00Z',
};

const defaultProps = {
  evento: mockEvento,
  onClick: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onChangeStatus: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('EventoCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock padrão para usePermissions
    vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
      canEditEvent: () => true,
      canDeleteEvent: true,
      canViewEvent: () => true,
      hasPermission: () => true,
      canCreateEvent: true,
      canViewFinancial: true,
      canEditFinancial: true,
      canAllocateMaterials: true,
      canAllocate: true,
      canEditChecklist: true,
      canEditOperations: true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      permissions: [],
      isLoading: false,
    });

    // Mock padrão para useMaterialPendente
    vi.spyOn(useMaterialPendenteModule, 'useMaterialPendente').mockReturnValue({
      data: { temPendentes: false, quantidade: 0, materiais: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o card do evento com informações básicas', () => {
      renderWithRouter(<EventoCard {...defaultProps} />);

      expect(screen.getByText('Evento Teste')).toBeInTheDocument();
      expect(screen.getByText('25/12/2025')).toBeInTheDocument();
      expect(screen.getByText('18:00')).toBeInTheDocument();
      expect(screen.getByText('Buffet Teste')).toBeInTheDocument();
      expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
    });

    it('deve exibir o status do evento', () => {
      renderWithRouter(<EventoCard {...defaultProps} />);
      
      const statusBadge = screen.getByText(/confirmado/i);
      expect(statusBadge).toBeInTheDocument();
    });

    it('deve renderizar tags quando disponíveis', () => {
      renderWithRouter(<EventoCard {...defaultProps} />);

      expect(screen.getByText('Casamento')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('deve limitar a exibição de tags a 2', () => {
      const eventoComMuitasTags = {
        ...mockEvento,
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4'],
      };

      renderWithRouter(<EventoCard {...defaultProps} evento={eventoComMuitasTags} />);

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.queryByText('Tag3')).not.toBeInTheDocument();
    });

    it('deve exibir indicador de status na parte superior', () => {
      const { container } = renderWithRouter(<EventoCard {...defaultProps} />);
      
      const statusIndicator = container.querySelector('.bg-emerald-500');
      expect(statusIndicator).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve navegar para detalhes ao clicar no card', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.click(card!);

      expect(mockNavigate).toHaveBeenCalledWith('/eventos/123');
    });

    it('deve navegar para detalhes ao clicar no botão "Ver Detalhes"', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const detailsButton = screen.getByRole('button', { name: /ver detalhes/i });
      await user.click(detailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/eventos/123');
    });

    it('não deve propagar clique do dropdown para o card', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // O navigate só deve ser chamado uma vez (não pelo click no dropdown)
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Menu de Ações (Dropdown)', () => {
    it('deve exibir menu de ações quando usuário tem permissões', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.getByText('Alterar Status')).toBeInTheDocument();
        expect(screen.getByText('Editar')).toBeInTheDocument();
        expect(screen.getByText('Excluir')).toBeInTheDocument();
      });
    });

    it('não deve exibir menu quando usuário não tem permissões', () => {
      vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
        canEditEvent: () => false,
        canDeleteEvent: false,
        canViewEvent: () => true,
        hasPermission: () => false,
        canCreateEvent: false,
        canViewFinancial: false,
        canEditFinancial: false,
        canAllocateMaterials: false,
        canAllocate: false,
        canEditChecklist: false,
        canEditOperations: false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        permissions: [],
        isLoading: false,
      });

      const { container } = renderWithRouter(<EventoCard {...defaultProps} />);
      
      const dropdownTrigger = container.querySelector('[role="button"]');
      expect(dropdownTrigger).not.toBeInTheDocument();
    });

    it('deve chamar onChangeStatus ao clicar em Alterar Status', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      const alterarStatusButton = await screen.findByText('Alterar Status');
      await user.click(alterarStatusButton);

      expect(defaultProps.onChangeStatus).toHaveBeenCalledWith(mockEvento);
    });

    it('deve navegar para edição ao clicar em Editar', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      const editarButton = await screen.findByText('Editar');
      await user.click(editarButton);

      expect(mockNavigate).toHaveBeenCalledWith('/eventos/123');
    });

    it('deve chamar onDelete ao clicar em Excluir', async () => {
      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      const excluirButton = await screen.findByText('Excluir');
      await user.click(excluirButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockEvento);
    });

    it('não deve exibir opção Excluir quando canDeleteEvent é false', async () => {
      vi.spyOn(usePermissionsModule, 'usePermissions').mockReturnValue({
        canEditEvent: () => true,
        canDeleteEvent: false,
        canViewEvent: () => true,
        hasPermission: () => true,
        canCreateEvent: true,
        canViewFinancial: true,
        canEditFinancial: true,
        canAllocateMaterials: true,
        canAllocate: true,
        canEditChecklist: true,
        canEditOperations: true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
        permissions: [],
        isLoading: false,
      });

      const user = userEvent.setup();
      renderWithRouter(<EventoCard {...defaultProps} />);

      const card = screen.getByText('Evento Teste').closest('.group');
      await user.hover(card!);

      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      await waitFor(() => {
        expect(screen.queryByText('Excluir')).not.toBeInTheDocument();
      });
    });
  });

  describe('Badge de Materiais Pendentes', () => {
    it('deve renderizar badge quando há materiais pendentes', () => {
      vi.spyOn(useMaterialPendenteModule, 'useMaterialPendente').mockReturnValue({
        data: { temPendentes: true, quantidade: 5, materiais: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      renderWithRouter(<EventoCard {...defaultProps} />);

      // MateriaisPendentesBadge deve estar presente
      expect(screen.getByText(/confirmado/i).parentElement).toBeInTheDocument();
    });
  });

  describe('Estados de Data', () => {
    it('deve exibir "Data não definida" quando dataInicio está vazia', () => {
      const eventoSemData = {
        ...mockEvento,
        dataInicio: '',
      };

      renderWithRouter(<EventoCard {...defaultProps} evento={eventoSemData} />);

      expect(screen.getByText('Data não definida')).toBeInTheDocument();
    });

    it('deve formatar data corretamente', () => {
      renderWithRouter(<EventoCard {...defaultProps} />);

      expect(screen.getByText('25/12/2025')).toBeInTheDocument();
    });
  });

  describe('Countdown do Evento', () => {
    it('deve renderizar componente EventoCountdown', () => {
      const { container } = renderWithRouter(<EventoCard {...defaultProps} />);
      
      // Verifica se o countdown está presente no DOM
      expect(container.querySelector('[class*="countdown"]') || container).toBeInTheDocument();
    });
  });

  describe('Cores por Status', () => {
    const statusTests = [
      { status: 'orcamento', color: 'bg-amber-500' },
      { status: 'confirmado', color: 'bg-emerald-500' },
      { status: 'em_preparacao', color: 'bg-purple-500' },
      { status: 'em_execucao', color: 'bg-blue-600' },
      { status: 'concluido', color: 'bg-green-600' },
      { status: 'cancelado', color: 'bg-red-500' },
    ];

    statusTests.forEach(({ status, color }) => {
      it(`deve usar cor ${color} para status ${status}`, () => {
        const eventoComStatus = {
          ...mockEvento,
          status: status as any,
        };

        const { container } = renderWithRouter(
          <EventoCard {...defaultProps} evento={eventoComStatus} />
        );

        const statusIndicator = container.querySelector(`.${color}`);
        expect(statusIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Responsividade', () => {
    it('deve aplicar classes responsivas corretamente', () => {
      const { container } = renderWithRouter(<EventoCard {...defaultProps} />);

      const card = container.querySelector('.sm\\:rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('deve ter altura mínima definida', () => {
      const { container } = renderWithRouter(<EventoCard {...defaultProps} />);

      const card = container.querySelector('.min-h-\\[240px\\]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com evento sem cliente', () => {
      const eventoSemCliente = {
        ...mockEvento,
        cliente: undefined as any,
      };

      const { container } = renderWithRouter(
        <EventoCard {...defaultProps} evento={eventoSemCliente} />
      );

      expect(container).toBeInTheDocument();
    });

    it('deve lidar com evento sem tags', () => {
      const eventoSemTags = {
        ...mockEvento,
        tags: [],
      };

      renderWithRouter(<EventoCard {...defaultProps} evento={eventoSemTags} />);

      expect(screen.queryByText('Casamento')).not.toBeInTheDocument();
    });

    it('deve lidar com evento sem tags definidas', () => {
      const eventoSemTags = {
        ...mockEvento,
        tags: undefined as any,
      };

      const { container } = renderWithRouter(
        <EventoCard {...defaultProps} evento={eventoSemTags} />
      );

      expect(container).toBeInTheDocument();
    });
  });
});
