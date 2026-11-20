import { cn, formatRupiah, formatRupiahShort } from "@/lib/utils";

export function Price({
  value,
  short = false,
  className,
}: {
  value: number;
  short?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("font-semibold tabular-nums text-navy-900", className)}>
      {short ? formatRupiahShort(value) : formatRupiah(value)}
    </span>
  );
}
