import { useState, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  blurDataURL?: string;
  priority?: boolean;
}

/**
 * Componente de imagem otimizada com:
 * - Lazy loading nativo (exceto priority)
 * - Blur placeholder opcional
 * - Skeleton durante carregamento
 * - Fallback em caso de erro
 * - Transição suave
 * - Decoding assíncrono
 */
export function OptimizedImage({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.svg',
  blurDataURL,
  priority = false,
  className,
  style,
  ...props 
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      {!loaded && (
        <>
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
            />
          )}
          <Skeleton className="absolute inset-0" />
        </>
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 w-full h-full object-cover",
          loaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />
    </div>
  );
}
