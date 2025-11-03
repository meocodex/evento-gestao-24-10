import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function DemandaCardSkeleton() {
  return (
    <Card className="p-5 border-2 border-navy-100 rounded-2xl bg-white">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        
        <div className="flex gap-2.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        
        <Separator className="my-3" />
        
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-navy-100/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}
