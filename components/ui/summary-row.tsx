import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Label/value row used in every price and payment summary. */
export function SummaryRow({
  label,
  children,
  strong = false,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", className)}>
      <span className={cn("text-muted", strong && "font-semibold text-navy-900")}>{label}</span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          strong ? "type-label text-navy-900" : "font-medium text-navy-900",
        )}
      >
        {children}
      </span>
    </div>
  );
}
