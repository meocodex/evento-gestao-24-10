import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventosSkeleton() {
  return (
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-pulse bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl bg-card border border-border/50">
          {/* Tabs */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
            <Skeleton className="h-7 w-14 rounded-md" />
            <Skeleton className="h-7 w-10 rounded-md" />
            <Skeleton className="h-7 w-12 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-md hidden lg:block" />
          </div>
          
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[90px]" />
          <Skeleton className="h-8 w-24" />
          
          {/* View Mode */}
          <div className="flex border border-border/60 rounded-lg overflow-hidden">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          
          <Skeleton className="h-8 w-20" />
          
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
