import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utilitários', () => {
  describe('cn (classnames merge)', () => {
    it('deve combinar classes simples', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('deve remover classes duplicadas', () => {
      const result = cn('class1', 'class1');
      expect(result).toBe('class1');
    });

    it('deve lidar com classes condicionais', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base active');
    });

    it('deve ignorar valores falsy', () => {
      const result = cn('class1', false, null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('deve combinar classes do Tailwind com conflitos', () => {
      // twMerge deve resolver conflitos de classes Tailwind
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4'); // px-4 sobrescreve px-2
    });

    it('deve trabalhar com arrays', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('deve trabalhar com objetos', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      });
      expect(result).toContain('class1');
      expect(result).toContain('class3');
      expect(result).not.toContain('class2');
    });

    it('deve combinar múltiplos formatos', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        { conditional: true, ignored: false },
        'final'
      );
      expect(result).toContain('base');
      expect(result).toContain('array1');
      expect(result).toContain('array2');
      expect(result).toContain('conditional');
      expect(result).toContain('final');
      expect(result).not.toContain('ignored');
    });

    it('deve retornar string vazia para entrada vazia', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});
