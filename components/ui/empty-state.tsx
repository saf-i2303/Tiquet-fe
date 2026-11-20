import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-canvas/60 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-navy-700 shadow-card">
        {icon ?? <Inbox aria-hidden="true" className="h-5 w-5" />}
      </div>
      <h3 className="type-label mt-3 text-navy-900">{title}</h3>
      {description && <p className="body-copy mt-1 max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
