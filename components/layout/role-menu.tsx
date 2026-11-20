"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Receipt,
  RotateCcw,
  ScanLine,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

const icons: Record<NavItem["icon"], ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  events: CalendarDays,
  ticket: Ticket,
  orders: Receipt,
  verification: BadgeCheck,
  report: ChartColumn,
  transaction: Receipt,
  refund: RotateCcw,
  team: Users,
  payout: Wallet,
  users: Users,
  organizers: BadgeCheck,
  moderation: ShieldCheck,
  activity: Activity,
  settings: Settings,
};

/** Missing icon fallback for nav items that have no dedicated glyph yet. */
const FallbackIcon = ScanLine;

export function DashboardNav({
  items,
  variant = "vertical",
}: {
  items: NavItem[];
  variant?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/organizer" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (variant === "horizontal") {
    return (
      <nav className="flex gap-2 overflow-x-auto pb-0.5" aria-label="Navigasi dashboard">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn("chip", isActive(item.href) && "chip-active")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="space-y-1" aria-label="Navigasi dashboard">
      {items.map((item) => {
        const Icon = icons[item.icon] ?? FallbackIcon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
              isActive(item.href)
                ? "bg-navy-900 text-white"
                : "text-navy-700 hover:bg-canvas hover:text-navy-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
