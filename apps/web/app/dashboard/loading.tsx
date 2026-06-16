import { CardSkeleton, AppointmentSkeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="divide-y">
          <AppointmentSkeleton />
          <AppointmentSkeleton />
        </div>
      </div>
    </div>
  );
}
