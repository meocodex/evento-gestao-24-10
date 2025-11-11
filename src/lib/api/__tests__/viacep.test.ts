import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buscarEnderecoPorCEP, buscarCEP } from '@/lib/api/viacep';

// Mock global fetch
global.fetch = vi.fn();

describe('viacep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buscarEnderecoPorCEP', () => {
    it('deve buscar endereço com CEP válido', async () => {
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: 'até 610 - lado par',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await buscarEnderecoPorCEP('01310-100');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/');
    });

    it('deve limpar CEP antes de buscar', async () => {
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await buscarEnderecoPorCEP('01.310-100');

      expect(global.fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/');
    });

    it('deve retornar null para CEP inválido (menos de 8 dígitos)', async () => {
      const result = await buscarEnderecoPorCEP('123');

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve retornar null para CEP inválido (mais de 8 dígitos)', async () => {
      const result = await buscarEnderecoPorCEP('012345678');

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve retornar null para CEP não encontrado', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true }),
      });

      const result = await buscarEnderecoPorCEP('99999-999');

      expect(result).toBeNull();
    });

    it('deve retornar null em caso de erro de rede', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await buscarEnderecoPorCEP('01310-100');

      expect(result).toBeNull();
    });

    it('deve retornar null se resposta não for ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await buscarEnderecoPorCEP('01310-100');

      expect(result).toBeNull();
    });

    it('deve aceitar CEP apenas com números', async () => {
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await buscarEnderecoPorCEP('01310100');

      expect(result).toEqual(mockResponse);
    });

    it('deve retornar estrutura completa com todos os campos', async () => {
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: 'até 610',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await buscarEnderecoPorCEP('01310-100');

      expect(result).toHaveProperty('cep');
      expect(result).toHaveProperty('logradouro');
      expect(result).toHaveProperty('complemento');
      expect(result).toHaveProperty('bairro');
      expect(result).toHaveProperty('localidade');
      expect(result).toHaveProperty('uf');
    });
  });

  describe('buscarCEP (alias)', () => {
    it('deve funcionar como alias de buscarEnderecoPorCEP', async () => {
      const mockResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await buscarCEP('01310-100');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Casos especiais', () => {
    it('deve lidar com CEP de zona rural', async () => {
      const mockResponse = {
        cep: '38500-000',
        logradouro: '',
        complemento: '',
        bairro: '',
        localidade: 'Monte Carmelo',
        uf: 'MG',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await buscarEnderecoPorCEP('38500-000');

      expect(result).toEqual(mockResponse);
      expect(result?.logradouro).toBe('');
    });

    it('deve logar erro no console em caso de falha', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      await buscarEnderecoPorCEP('01310-100');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao buscar CEP:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
