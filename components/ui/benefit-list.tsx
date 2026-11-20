import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact check-list for selling points, terms and included benefits. */
export function BenefitList({
  items,
  className,
  itemClassName,
  iconClassName,
}: {
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
}) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <li key={index} className={cn("flex items-start gap-2 text-sm text-navy-700", itemClassName)}>
          <CircleCheck
            aria-hidden="true"
            className={cn("mt-0.5 h-4 w-4 shrink-0 text-success", iconClassName)}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
