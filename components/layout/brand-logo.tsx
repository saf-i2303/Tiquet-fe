import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
  showTagline = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-10 inline-flex items-center gap-2.5 text-sm font-semibold tracking-[-0.01em] transition",
        tone === "light"
          ? "text-white hover:text-gold-300"
          : "text-navy-900 hover:text-gold-600",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-gold-400 text-navy-950 shadow-lg shadow-gold-500/30">
        <Ticket className="size-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span>Tiquet</span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-widest",
              tone === "light" ? "text-gold-100/70" : "text-muted",
            )}
          >
            Event marketplace
          </span>
        )}
      </span>
    </Link>
  );
}
