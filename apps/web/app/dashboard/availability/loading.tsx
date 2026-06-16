import { CardSkeleton } from "@/components/skeleton";

export default function AvailabilityLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-8 animate-pulse rounded bg-gray-100" />
              <div className="h-8 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
