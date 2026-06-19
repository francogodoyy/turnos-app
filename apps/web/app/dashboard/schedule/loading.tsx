import { CardSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <div className="grid min-w-[1000px] grid-cols-[80px_repeat(7,1fr)]">
          <div />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-b border-r p-2 text-center">
              <div className="mx-auto h-4 w-10 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mt-1 h-8 w-8 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
          {Array.from({ length: 12 }).map((_, h) => (
            <>
              <div className="flex items-start justify-end border-b border-r p-2">
                <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
              </div>
              {Array.from({ length: 7 }).map((_, d) => (
                <div key={`${h}-${d}`} className="border-b border-r p-1">
                  <div className="h-[60px] w-full animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
