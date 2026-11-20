import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page-width container with consistent vertical rhythm for landing sections. */
export function SectionContainer({
  children,
  className,
  spacing = "py-12 sm:py-16",
}: {
  children: ReactNode;
  className?: string;
  spacing?: string;
}) {
  return <div className={cn("page-container", spacing, className)}>{children}</div>;
}
