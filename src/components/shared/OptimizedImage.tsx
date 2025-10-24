import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Componente de imagem otimizada com:
 * - WebP com fallback automático via <picture>
 * - Lazy loading avançado com IntersectionObserver
 * - Blur placeholder opcional
 * - Skeleton durante carregamento
 * - Srcset para imagens responsivas
 * - Decoding assíncrono
 * - Transição suave
 */
export function OptimizedImage({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.svg',
  blurDataURL,
  priority = false,
  className,
  style,
  sizes,
  width,
  height,
  ...props 
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(priority ? src : undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  // Advanced lazy loading with IntersectionObserver
  useEffect(() => {
    if (priority || !imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Preload 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, priority]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  // Generate WebP version URL (assumes .webp version exists or will be created)
  const webpSrc = imageSrc?.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const shouldUseWebP = imageSrc && /\.(jpg|jpeg|png)$/i.test(imageSrc);

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (!width || !height) return undefined;
    
    const widths = [640, 750, 828, 1080, 1200, 1920];
    const applicableWidths = widths.filter(w => w <= Number(width));
    
    if (applicableWidths.length === 0) return undefined;
    
    return applicableWidths
      .map(w => {
        const scaledSrc = baseSrc; // In production, use a CDN that supports width parameters
        return `${scaledSrc} ${w}w`;
      })
      .join(', ');
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
      
      {shouldUseWebP ? (
        <picture>
          <source 
            srcSet={generateSrcSet(webpSrc!) || webpSrc} 
            type="image/webp"
            sizes={sizes}
          />
          <source 
            srcSet={generateSrcSet(imageSrc!) || imageSrc} 
            type={imageSrc!.match(/\.png$/i) ? 'image/png' : 'image/jpeg'}
            sizes={sizes}
          />
          <img
            ref={imgRef}
            src={error ? fallbackSrc : imageSrc}
            alt={alt}
            width={width}
            height={height}
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
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={error ? fallbackSrc : imageSrc}
          alt={alt}
          width={width}
          height={height}
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
      )}
    </div>
  );
}
