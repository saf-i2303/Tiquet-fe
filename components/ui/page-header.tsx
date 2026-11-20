import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

/** Page-level heading. Keeps the same shape as SectionHeading, at H1 scale. */
export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <SectionHeading
      as="h1"
      kicker={kicker}
      title={title}
      description={subtitle}
      action={action}
      className={cn("mb-6 items-end", className)}
      titleClassName="type-page"
    />
  );
}
