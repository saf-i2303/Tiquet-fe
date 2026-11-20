import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/back-link";
import { cn } from "@/lib/utils";

/** Shared header for detail pages: back link, title, status badge and actions. */
export function DetailHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  badge,
  actions,
  className,
}: {
  backHref: string;
  backLabel?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <BackLink href={backHref} label={backLabel} className="mb-3" />
      <div className="toolbar items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="type-page min-w-0 text-navy-900">{title}</h1>
            {badge}
          </div>
          {subtitle && <div className="mt-1 text-sm text-muted">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
