import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Heading for a section that is not wrapped in <Card>. */
export function SectionHeading({
  title,
  description,
  action,
  kicker,
  as = "h2",
  titleClassName = "type-subhead",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  kicker?: ReactNode;
  as?: "h1" | "h2" | "h3";
  titleClassName?: string;
  className?: string;
}) {
  const Heading = as;

  return (
    <div className={cn("toolbar items-end", className)}>
      <div className="min-w-0">
        {kicker && <p className="eyebrow mb-1 text-muted">{kicker}</p>}
        <Heading className={cn("text-navy-900", titleClassName)}>{title}</Heading>
        {description && <p className="body-copy mt-1 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
