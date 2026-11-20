import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatTone = "navy" | "gold" | "green" | "blue";

const iconTones: Record<StatTone, string> = {
  navy: "bg-navy-900 text-white",
  gold: "bg-gold-100 text-gold-600",
  green: "bg-success-soft text-success",
  blue: "bg-info-soft text-info",
};

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "navy",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">{label}</div>
          <div className="type-page mt-1 text-navy-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
        </div>
        {icon && (
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-control",
              iconTones[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
