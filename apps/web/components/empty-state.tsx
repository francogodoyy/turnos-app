import { CalendarDays, Clock, Search } from "lucide-react";

const icons = {
  calendar: CalendarDays,
  clock: Clock,
  search: Search,
} as const;

interface Props {
  icon?: keyof typeof icons;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({
  icon = "calendar",
  title,
  description,
  action,
}: Props) {
  const Icon = icons[icon];

  return (
    <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center shadow-sm transition-all hover:shadow-md">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
        <Icon size={32} className="text-gray-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-500">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      )}
      {action && (
        <a
          href={action.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {action.label} &rarr;
        </a>
      )}
    </div>
  );
}
