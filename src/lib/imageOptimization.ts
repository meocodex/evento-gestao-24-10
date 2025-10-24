/**
 * Utilitários para otimização de imagens
 * - Conversão para WebP
 * - Geração de blur placeholders
 * - Redimensionamento automático
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const WEBP_QUALITY = 0.85;
const THUMBNAIL_SIZE = 20;

/**
 * Converte uma imagem para WebP com qualidade otimizada
 */
export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Redimensionar se necessário
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Gera um blur placeholder em base64 para uma imagem
 */
export async function generateBlurDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = THUMBNAIL_SIZE;
      canvas.height = THUMBNAIL_SIZE;

      ctx.drawImage(img, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.1);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Otimiza uma imagem: converte para WebP e gera blur placeholder
 */
export async function optimizeImage(file: File): Promise<{
  optimizedFile: File;
  blurDataURL: string;
}> {
  const [webpBlob, blurDataURL] = await Promise.all([
    convertToWebP(file),
    generateBlurDataURL(file),
  ]);

  const optimizedFile = new File(
    [webpBlob],
    file.name.replace(/\.[^.]+$/, '.webp'),
    { type: 'image/webp' }
  );

  return { optimizedFile, blurDataURL };
}

/**
 * Gera URLs responsivas (srcset) para uma imagem
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [640, 750, 828, 1080, 1200, 1920]): string {
  return widths
    .map(w => `${baseUrl}?w=${w} ${w}w`)
    .join(', ');
}

/**
 * Gera sizes attribute para responsive images
 */
export function generateSizes(breakpoints: { maxWidth: string; size: string }[] = [
  { maxWidth: '640px', size: '100vw' },
  { maxWidth: '768px', size: '50vw' },
  { maxWidth: '1024px', size: '33vw' },
]): string {
  const sizeStrings = breakpoints.map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`);
  return [...sizeStrings, '25vw'].join(', ');
}

/**
 * Valida se o arquivo é uma imagem suportada
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') && 
         ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
}

/**
 * Valida tamanho máximo de arquivo (em MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
