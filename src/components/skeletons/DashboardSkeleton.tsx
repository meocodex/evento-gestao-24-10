import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      {/* Stats Grid - 4 cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Two cards side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Eventos */}
        <Card className="rounded-xl">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Demandas Recentes */}
        <Card className="rounded-xl">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alertas Operacionais */}
      <Card className="rounded-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
