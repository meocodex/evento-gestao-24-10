import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button';
}

export function LoadingSkeleton({ className, variant = 'card' }: LoadingSkeletonProps) {
  const variantStyles = {
    card: 'h-32 rounded-lg',
    text: 'h-4 rounded',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-muted',
        variantStyles[variant],
        className
      )}
    >
      <div 
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          backgroundSize: '1000px 100%',
        }}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
        <LoadingSkeleton variant="avatar" />
      </div>
      
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="w-full" />
        <LoadingSkeleton variant="text" className="w-5/6" />
        <LoadingSkeleton variant="text" className="w-4/6" />
      </div>
      
      <LoadingSkeleton variant="button" className="w-full" />
    </div>
  );
}
