"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavTabs({
  items,
  className,
}: {
  items: { href: string; label: string; count?: number }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-2 overflow-x-auto pb-1", className)} aria-label="Navigasi">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("chip", active && "chip-active")}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-bold",
                  active ? "bg-white/20 text-white" : "bg-navy-900/5 text-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
