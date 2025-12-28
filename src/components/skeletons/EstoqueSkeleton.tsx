import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EstoqueSkeleton() {
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
          <Skeleton className="h-8 w-[160px]" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>

        {/* Table */}
        <Card className="p-0">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
