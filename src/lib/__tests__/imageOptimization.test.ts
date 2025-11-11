import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  convertToWebP,
  generateBlurDataURL,
  optimizeImage,
  generateSrcSet,
  generateSizes,
  isImageFile,
  validateFileSize,
} from '@/lib/imageOptimization';

// Mock do Canvas e Image
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src: string = '';
  width: number = 1920;
  height: number = 1080;

  set src(value: string) {
    this._src = value;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  
  get src() {
    return this._src;
  }
}

class MockCanvas {
  width: number = 0;
  height: number = 0;
  
  getContext() {
    return {
      drawImage: vi.fn(),
    };
  }

  toBlob(callback: (blob: Blob | null) => void, type: string, quality: number) {
    const blob = new Blob(['fake-image-data'], { type });
    callback(blob);
  }

  toDataURL(type: string, quality: number) {
    return 'data:image/jpeg;base64,fakebase64data';
  }
}

global.Image = MockImage as any;
global.document = {
  createElement: (tag: string) => {
    if (tag === 'canvas') return new MockCanvas() as any;
    return {} as any;
  },
} as any;

global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as any;

describe('imageOptimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isImageFile', () => {
    it('deve aceitar JPEG', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isImageFile(file)).toBe(true);
    });

    it('deve aceitar PNG', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(isImageFile(file)).toBe(true);
    });

    it('deve aceitar WebP', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      expect(isImageFile(file)).toBe(true);
    });

    it('deve rejeitar PDF', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isImageFile(file)).toBe(false);
    });

    it('deve rejeitar texto', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isImageFile(file)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('deve aceitar arquivo dentro do limite padrão (10MB)', () => {
      const size5MB = 5 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size5MB)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file)).toBe(true);
    });

    it('deve rejeitar arquivo acima do limite padrão', () => {
      const size15MB = 15 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size15MB)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file)).toBe(false);
    });

    it('deve aceitar arquivo dentro do limite customizado', () => {
      const size3MB = 3 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size3MB)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file, 5)).toBe(true);
    });

    it('deve rejeitar arquivo acima do limite customizado', () => {
      const size8MB = 8 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size8MB)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file, 5)).toBe(false);
    });

    it('deve aceitar arquivo exatamente no limite', () => {
      const size10MB = 10 * 1024 * 1024;
      const file = new File([new ArrayBuffer(size10MB)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file, 10)).toBe(true);
    });
  });

  describe('convertToWebP', () => {
    it('deve converter imagem para WebP', async () => {
      const file = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await convertToWebP(file);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/webp');
    });
  });

  describe('generateBlurDataURL', () => {
    it('deve gerar blur data URL', async () => {
      const file = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await generateBlurDataURL(file);

      expect(result).toContain('data:image/jpeg;base64');
    });
  });

  describe('optimizeImage', () => {
    it('deve otimizar imagem e gerar blur placeholder', async () => {
      const file = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await optimizeImage(file);

      expect(result).toHaveProperty('optimizedFile');
      expect(result).toHaveProperty('blurDataURL');
      expect(result.optimizedFile.name).toContain('.webp');
      expect(result.blurDataURL).toContain('data:image');
    });

    it('deve alterar extensão para .webp', async () => {
      const file = new File(['fake-image'], 'photo.png', { type: 'image/png' });
      
      const result = await optimizeImage(file);

      expect(result.optimizedFile.name).toBe('photo.webp');
    });
  });

  describe('generateSrcSet', () => {
    it('deve gerar srcset com larguras padrão', () => {
      const srcset = generateSrcSet('https://example.com/image.jpg');

      expect(srcset).toContain('640w');
      expect(srcset).toContain('750w');
      expect(srcset).toContain('1920w');
    });

    it('deve gerar srcset com larguras customizadas', () => {
      const srcset = generateSrcSet('https://example.com/image.jpg', [400, 800, 1200]);

      expect(srcset).toContain('400w');
      expect(srcset).toContain('800w');
      expect(srcset).toContain('1200w');
      expect(srcset).not.toContain('640w');
    });

    it('deve formatar URLs corretamente', () => {
      const srcset = generateSrcSet('https://example.com/image.jpg', [640]);

      expect(srcset).toBe('https://example.com/image.jpg?w=640 640w');
    });
  });

  describe('generateSizes', () => {
    it('deve gerar sizes com breakpoints padrão', () => {
      const sizes = generateSizes();

      expect(sizes).toContain('(max-width: 640px) 100vw');
      expect(sizes).toContain('(max-width: 768px) 50vw');
      expect(sizes).toContain('25vw');
    });

    it('deve gerar sizes com breakpoints customizados', () => {
      const customBreakpoints = [
        { maxWidth: '480px', size: '100vw' },
        { maxWidth: '1024px', size: '40vw' },
      ];

      const sizes = generateSizes(customBreakpoints);

      expect(sizes).toContain('(max-width: 480px) 100vw');
      expect(sizes).toContain('(max-width: 1024px) 40vw');
      expect(sizes).toContain('25vw');
    });

    it('deve sempre incluir fallback de 25vw', () => {
      const sizes = generateSizes([]);

      expect(sizes).toBe('25vw');
    });
  });
});
