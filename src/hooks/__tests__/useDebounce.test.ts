import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('valor inicial', 500));
    
    expect(result.current).toBe('valor inicial');
  });

  it('deve atrasar atualização do valor', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'inicial', delay: 500 } }
    );

    expect(result.current).toBe('inicial');

    // Atualizar valor
    rerender({ value: 'novo valor', delay: 500 });

    // Valor ainda não deve ter mudado
    expect(result.current).toBe('inicial');

    // Avançar timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Agora o valor deve ter atualizado
    expect(result.current).toBe('novo valor');
  });

  it('deve cancelar timeout anterior se valor mudar antes do delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'inicial' } }
    );

    // Primeira mudança
    rerender({ value: 'valor 1' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Segunda mudança antes de completar o delay
    rerender({ value: 'valor 2' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Ainda deve estar com valor inicial
    expect(result.current).toBe('inicial');

    // Completar o delay da segunda mudança
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('valor 2');
  });

  it('deve usar delay customizado', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'inicial' } }
    );

    rerender({ value: 'novo' });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('inicial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('novo');
  });

  it('deve funcionar com diferentes tipos de valores', async () => {
    // Teste com número
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(numberResult.current).toBe(42);

    // Teste com objeto
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'João' } } }
    );

    const newObj = { name: 'Maria' };
    objectRerender({ value: newObj });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(objectResult.current).toEqual(newObj);
  });
});
