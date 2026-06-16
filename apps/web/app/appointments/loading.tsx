import { AppointmentSkeleton } from "@/components/skeleton";

export default function AppointmentsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

      <div className="space-y-3">
        <AppointmentSkeleton />
        <AppointmentSkeleton />
        <AppointmentSkeleton />
      </div>
    </div>
  );
}
