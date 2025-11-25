import { toast } from "sonner";

/**
 * Força o download de um arquivo a partir de uma URL
 * Funciona mesmo com bloqueadores de anúncios do navegador
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Falha ao baixar arquivo');
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar o blob URL após um pequeno delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    toast.error('Erro ao baixar arquivo');
    throw error;
  }
}
