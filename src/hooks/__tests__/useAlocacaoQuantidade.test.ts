import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlocacaoQuantidade } from '../useAlocacaoQuantidade';

describe('useAlocacaoQuantidade', () => {
  describe('Inicialização', () => {
    it('deve inicializar com quantidade 1', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 5,
        })
      );

      expect(result.current.quantidadeAlocar).toBe(1);
    });

    it('deve calcular maxAllowed corretamente', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 5,
        })
      );

      expect(result.current.maxAllowed).toBe(5); // Menor valor entre 10 e 5
    });

    it('deve usar quantidadeRestante quando menor', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 3,
          quantidadeDisponivel: 10,
        })
      );

      expect(result.current.maxAllowed).toBe(3);
    });

    it('deve garantir valores não negativos', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: -5,
          quantidadeDisponivel: -10,
        })
      );

      expect(result.current.maxAllowed).toBe(0);
    });

    it('deve tratar null/undefined como 0', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: null as any,
          quantidadeDisponivel: undefined as any,
        })
      );

      expect(result.current.maxAllowed).toBe(0);
    });
  });

  describe('handleQuantidadeChange', () => {
    it('deve atualizar quantidade dentro do limite', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '5' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(5);
    });

    it('deve limitar ao máximo permitido', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 5,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '20' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(5); // Limitado a maxAllowed
    });

    it('deve garantir mínimo de 1', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '0' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(1);
    });

    it('deve garantir mínimo de 1 para valores negativos', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '-5' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(1);
    });

    it('deve tratar entrada vazia como 1', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(1);
    });

    it('deve tratar entrada não numérica como 1', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: 'abc' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(1);
    });
  });

  describe('setQuantidadeAlocar', () => {
    it('deve permitir definir quantidade diretamente', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.setQuantidadeAlocar(7);
      });

      expect(result.current.quantidadeAlocar).toBe(7);
    });

    it('não deve validar ao usar setQuantidadeAlocar diretamente', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 5,
          quantidadeDisponivel: 5,
        })
      );

      act(() => {
        result.current.setQuantidadeAlocar(100);
      });

      // setQuantidadeAlocar não faz validação, permite qualquer valor
      expect(result.current.quantidadeAlocar).toBe(100);
    });
  });

  describe('resetQuantidade', () => {
    it('deve resetar quantidade para 1', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.setQuantidadeAlocar(5);
      });

      expect(result.current.quantidadeAlocar).toBe(5);

      act(() => {
        result.current.resetQuantidade();
      });

      expect(result.current.quantidadeAlocar).toBe(1);
    });
  });

  describe('isValid', () => {
    it('deve ser válido quando há quantidade disponível', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 5,
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('deve ser inválido quando não há quantidade disponível', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 0,
          quantidadeDisponivel: 0,
        })
      );

      expect(result.current.isValid).toBe(false);
    });

    it('deve ser inválido quando restante é 0', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 0,
          quantidadeDisponivel: 10,
        })
      );

      expect(result.current.isValid).toBe(false);
    });

    it('deve ser inválido quando disponível é 0', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 0,
        })
      );

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Cenários de borda', () => {
    it('deve lidar com números decimais arredondando', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 10,
          quantidadeDisponivel: 10,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '5.7' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(5); // parseInt trunca
    });

    it('deve lidar com valores muito grandes', () => {
      const { result } = renderHook(() =>
        useAlocacaoQuantidade({
          quantidadeRestante: 5,
          quantidadeDisponivel: 3,
        })
      );

      act(() => {
        result.current.handleQuantidadeChange({
          target: { value: '999999' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.quantidadeAlocar).toBe(3); // Limitado a maxAllowed
    });

    it('deve recalcular maxAllowed quando props mudam', () => {
      const { result, rerender } = renderHook(
        (props) => useAlocacaoQuantidade(props),
        {
          initialProps: {
            quantidadeRestante: 10,
            quantidadeDisponivel: 5,
          },
        }
      );

      expect(result.current.maxAllowed).toBe(5);

      rerender({
        quantidadeRestante: 10,
        quantidadeDisponivel: 8,
      });

      expect(result.current.maxAllowed).toBe(8);
    });
  });
});
