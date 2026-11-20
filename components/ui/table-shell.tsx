import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent horizontal scroll wrapper for every wide table. */
export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full overflow-x-auto", className)}>{children}</div>;
}
