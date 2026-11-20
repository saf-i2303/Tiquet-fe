import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/constants";

/**
 * Single source of truth for badge colours. `glass` is for badges placed
 * directly on a photo or dark gradient surface.
 */
const tones: Record<Tone | "glass", string> = {
  gold: "border-gold-500/40 bg-gold-100 text-gold-600",
  navy: "border-navy-900 bg-navy-900 text-white",
  blue: "border-info/20 bg-info-soft text-info",
  green: "border-success/20 bg-success-soft text-success",
  red: "border-danger/20 bg-danger-soft text-danger",
  amber: "border-warning/20 bg-warning-soft text-warning",
  slate: "border-line bg-navy-900/5 text-muted",
  glass: "border-white/20 bg-navy-950/55 text-white backdrop-blur-sm",
};

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone | "glass";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
