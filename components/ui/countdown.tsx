"use client";

import { Timer } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

export function Countdown({
  target,
  className,
  label = "Sisa waktu pembayaran",
}: {
  target: string;
  className?: string;
  label?: string;
}) {
  const display = useCountdown(target);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-warning",
        className,
      )}
    >
      <Timer className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
      <span className="ml-auto font-mono text-sm font-bold tabular-nums">{display}</span>
    </div>
  );
}
