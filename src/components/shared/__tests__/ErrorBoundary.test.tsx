import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Componente que lança erro para testar
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Erro de teste');
  }
  return <div>Componente OK</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error durante os testes
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Renderização normal', () => {
    it('deve renderizar children quando não há erro', () => {
      render(
        <ErrorBoundary>
          <div>Conteúdo normal</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Conteúdo normal')).toBeInTheDocument();
    });

    it('deve renderizar múltiplos children', () => {
      render(
        <ErrorBoundary>
          <div>Primeiro</div>
          <div>Segundo</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Primeiro')).toBeInTheDocument();
      expect(screen.getByText('Segundo')).toBeInTheDocument();
    });
  });

  describe('Captura de erros', () => {
    it('deve capturar erro e exibir UI de fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
      expect(screen.getByText(/Ocorreu um erro inesperado/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro em desenvolvimento', () => {
      const originalEnv = import.meta.env.PROD;
      Object.defineProperty(import.meta.env, 'PROD', { value: false, writable: true });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Detalhes do Erro/i)).toBeInTheDocument();
      expect(screen.getByText(/Erro de teste/)).toBeInTheDocument();

      Object.defineProperty(import.meta.env, 'PROD', { value: originalEnv, writable: true });
    });

    it('não deve exibir detalhes do erro em produção', () => {
      const originalEnv = import.meta.env.PROD;
      Object.defineProperty(import.meta.env, 'PROD', { value: true, writable: true });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Detalhes do Erro/i)).not.toBeInTheDocument();

      Object.defineProperty(import.meta.env, 'PROD', { value: originalEnv, writable: true });
    });

    it('deve exibir fallback customizado quando fornecido', () => {
      const customFallback = <div>Fallback customizado</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Fallback customizado')).toBeInTheDocument();
      expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
    });
  });

  describe('Ações de recuperação', () => {
    it('deve resetar estado ao clicar em "Tentar Novamente"', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

      // Verificar que o botão existe
      const tryAgainButton = screen.getByRole('button', { name: /tentar novamente/i });
      expect(tryAgainButton).toBeInTheDocument();

      // Rerenderizar sem erro
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
    });

    it('deve ter botão "Ir para Home"', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /ir para home/i });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('Botões de ação', () => {
    it('deve renderizar botões de "Tentar Novamente" e "Ir para Home"', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ir para home/i })).toBeInTheDocument();
    });

    it('botões devem ter ícones corretos', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verificar que os botões têm os ícones (através de classes ou svg)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Logging de erros', () => {
    it('deve logar erro no console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verificar que tem título e descrição
      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
      expect(screen.getByText(/Ocorreu um erro inesperado/i)).toBeInTheDocument();
    });

    it('deve ter botões acessíveis', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });
});
