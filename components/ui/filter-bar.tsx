import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterChip = {
  label: string;
  href: string;
  active?: boolean;
  count?: number;
};

/**
 * Server-compatible filter row: pill links + an optional GET search form.
 * Pass the currently active non-search params through `hidden` so searching
 * never drops the active filter (and vice versa).
 */
export function FilterBar({
  chips = [],
  searchPlaceholder = "Cari...",
  searchName = "q",
  defaultValue = "",
  hidden = {},
  showSearch = true,
  className,
}: {
  chips?: FilterChip[];
  searchPlaceholder?: string;
  searchName?: string;
  defaultValue?: string;
  hidden?: Record<string, string | undefined>;
  showSearch?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {chips.length > 0 && (
        <nav className="flex flex-wrap gap-2" aria-label="Filter">
          {chips.map((chip) => (
            <Link
              key={`${chip.href}-${chip.label}`}
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={cn("chip", chip.active && "chip-active")}
            >
              {chip.label}
              {typeof chip.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-bold",
                    chip.active ? "bg-white/20 text-white" : "bg-navy-900/5 text-muted",
                  )}
                >
                  {chip.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {showSearch && (
        <form method="get" className="relative w-full sm:max-w-xs">
          {Object.entries(hidden).map(([key, value]) =>
            value ? <input key={key} type="hidden" name={key} value={value} /> : null,
          )}
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name={searchName}
            defaultValue={defaultValue}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="input py-2 pl-9"
          />
        </form>
      )}
    </div>
  );
}
