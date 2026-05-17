export { TableSkeleton, CardSkeleton } from "@/components/loading-skeleton";

import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-2 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
