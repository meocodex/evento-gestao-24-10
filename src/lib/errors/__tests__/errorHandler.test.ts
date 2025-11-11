import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleApiError, withErrorHandling } from '@/lib/errors/errorHandler';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('deve retornar erro com mensagem customizada', () => {
      const error = new Error('Original error');
      const result = handleApiError(error, 'Erro customizado');

      expect(result.message).toBe('Erro customizado');
      expect(toast.error).toHaveBeenCalledWith('Erro customizado');
    });

    it('deve detectar erro de conexão offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const error = new Error('Network error');
      const result = handleApiError(error);

      expect(result.message).toBe('Sem conexão com a internet. Verifique sua conexão.');
      expect(toast.error).toHaveBeenCalled();

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('deve identificar erro de credenciais inválidas', () => {
      const error = { message: 'Invalid login credentials' };
      const result = handleApiError(error);

      expect(result.message).toBe('Email ou senha incorretos.');
    });

    it('deve identificar erro de email já cadastrado', () => {
      const error = { message: 'User already registered' };
      const result = handleApiError(error);

      expect(result.message).toBe('Este email já está cadastrado.');
    });

    it('deve identificar erro de email não confirmado', () => {
      const error = { message: 'Email not confirmed' };
      const result = handleApiError(error);

      expect(result.message).toBe('Por favor, confirme seu email antes de fazer login.');
    });

    it('deve identificar erro de rede', () => {
      const error = { message: 'Failed to fetch' };
      const result = handleApiError(error);

      expect(result.message).toBe('Erro de conexão. Verifique sua internet.');
    });

    it('deve identificar erro de permissão', () => {
      const error = { message: 'Permission denied' };
      const result = handleApiError(error);

      expect(result.message).toBe('Você não tem permissão para realizar esta ação.');
    });

    it('deve identificar erro de validação', () => {
      const error = { message: 'Violates check constraint' };
      const result = handleApiError(error);

      expect(result.message).toBe('Dados inválidos. Verifique as informações.');
    });

    it('deve tratar erro HTTP 400', () => {
      const error = { status: 400 };
      const result = handleApiError(error);

      expect(result.message).toBe('Requisição inválida. Verifique os dados.');
    });

    it('deve tratar erro HTTP 401', () => {
      const error = { status: 401 };
      const result = handleApiError(error);

      expect(result.message).toBe('Não autorizado. Faça login novamente.');
    });

    it('deve tratar erro HTTP 403', () => {
      const error = { status: 403 };
      const result = handleApiError(error);

      expect(result.message).toBe('Acesso negado.');
    });

    it('deve tratar erro HTTP 404', () => {
      const error = { status: 404 };
      const result = handleApiError(error);

      expect(result.message).toBe('Recurso não encontrado.');
    });

    it('deve tratar erro HTTP 408', () => {
      const error = { status: 408 };
      const result = handleApiError(error);

      expect(result.message).toBe('Tempo de resposta esgotado. Tente novamente.');
    });

    it('deve tratar erro HTTP 429', () => {
      const error = { status: 429 };
      const result = handleApiError(error);

      expect(result.message).toBe('Muitas requisições. Aguarde um momento.');
    });

    it('deve tratar erro HTTP 500', () => {
      const error = { status: 500 };
      const result = handleApiError(error);

      expect(result.message).toBe('Erro no servidor. Tente novamente mais tarde.');
    });

    it('deve incluir code e status no retorno', () => {
      const error = { message: 'Error', code: 'PGRST123', status: 400 };
      const result = handleApiError(error);

      expect(result.code).toBe('PGRST123');
      expect(result.status).toBe(400);
      expect(result.details).toBe(error);
    });

    it('deve tratar erros PGRST genéricos', () => {
      const error = { message: 'Database error', code: 'PGRST116' };
      const result = handleApiError(error);

      expect(result.message).toBe('Erro ao acessar os dados. Tente novamente.');
    });
  });

  describe('withErrorHandling', () => {
    it('deve executar função com sucesso', async () => {
      const successFn = vi.fn().mockResolvedValue('Success result');

      const result = await withErrorHandling(successFn);

      expect(result).toBe('Success result');
      expect(successFn).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('deve capturar erro e retornar null', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));

      const result = await withErrorHandling(errorFn);

      expect(result).toBeNull();
      expect(errorFn).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });

    it('deve usar mensagem customizada em caso de erro', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));

      await withErrorHandling(errorFn, 'Erro personalizado');

      expect(toast.error).toHaveBeenCalledWith('Erro personalizado');
    });

    it('deve permitir retorno de diferentes tipos', async () => {
      const objectFn = vi.fn().mockResolvedValue({ data: 'test' });
      const numberFn = vi.fn().mockResolvedValue(42);
      const arrayFn = vi.fn().mockResolvedValue([1, 2, 3]);

      const result1 = await withErrorHandling(objectFn);
      const result2 = await withErrorHandling(numberFn);
      const result3 = await withErrorHandling(arrayFn);

      expect(result1).toEqual({ data: 'test' });
      expect(result2).toBe(42);
      expect(result3).toEqual([1, 2, 3]);
    });
  });
});
