import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type QuickLink = {
  href: string;
  label: string;
  icon?: ReactNode;
};

/** Reusable dashboard/detail shortcut list. */
export function QuickLinksCard({
  items,
  title = "Aksi cepat",
  className,
}: {
  items: QuickLink[];
  title?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <CardHeader title={title} />
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2.5 text-sm font-medium text-navy-800 transition hover:border-navy-900/25 hover:bg-canvas"
          >
            {item.icon && <span className="shrink-0 text-navy-600">{item.icon}</span>}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
