import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/lib/constants";

export function StatusBadge({
  value,
  map,
  className,
}: {
  value: string;
  map: Record<string, { label: string; tone: Tone }>;
  className?: string;
}) {
  const meta = map[value] ?? { label: value, tone: "slate" as Tone };
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
