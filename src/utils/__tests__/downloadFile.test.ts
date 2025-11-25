import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile } from '../downloadFile';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('downloadFile', () => {
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test content'])),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve fazer download de arquivo com sucesso', async () => {
    await downloadFile('https://example.com/file.pdf', 'test.pdf');

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/file.pdf');
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('deve exibir erro quando fetch falha', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    await expect(downloadFile('https://example.com/file.pdf', 'test.pdf')).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith('Erro ao baixar arquivo');
  });

  it('deve limpar blob URL após download', async () => {
    vi.useFakeTimers();
    
    await downloadFile('https://example.com/file.pdf', 'test.pdf');
    
    vi.advanceTimersByTime(100);
    
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    
    vi.useRealTimers();
  });
});
