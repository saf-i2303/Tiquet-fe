import { CalendarDays, Clock, MapPin } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";

type Props = {
  date: string;
  endDate?: string | null;
  time?: string | null;
  venue?: string | null;
  city?: string | null;
  layout?: "inline" | "stacked";
  className?: string;
};

export function EventMeta({
  date,
  endDate,
  time,
  venue,
  city,
  layout = "inline",
  className,
}: Props) {
  const dateLabel = endDate
    ? `${formatDate(date, { day: "numeric", month: "short" })} – ${formatDate(endDate, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : formatDate(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const items = [
    { key: "date", icon: CalendarDays, text: dateLabel },
    time ? { key: "time", icon: Clock, text: formatTime(time) } : null,
    venue || city
      ? { key: "place", icon: MapPin, text: [venue, city].filter(Boolean).join(", ") }
      : null,
  ].filter((item): item is { key: string; icon: typeof CalendarDays; text: string } => item !== null);

  return (
    <div
      className={cn(
        "text-sm text-muted",
        layout === "inline"
          ? "flex flex-wrap items-center gap-x-5 gap-y-2"
          : "flex flex-col items-start gap-2.5",
        className,
      )}
    >
      {items.map(({ key, icon: Icon, text }) => (
        <span key={key} className="inline-flex min-w-0 items-center gap-1.5">
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-navy-600" />
          <span className="min-w-0">{text}</span>
        </span>
      ))}
    </div>
  );
}
