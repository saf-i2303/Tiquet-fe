import { percent } from "@/lib/utils";

export function Progress({
  value,
  total,
  label,
  showLabel = true,
  className,
}: {
  value: number;
  total: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const ratio = percent(value, total);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted">
          <span>{label ?? "Terjual"}</span>
          <span className="font-semibold tabular-nums text-navy-900">
            {value.toLocaleString("id-ID")} / {total.toLocaleString("id-ID")} ({ratio}%)
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={ratio}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-navy-900/10"
      >
        <div className="h-full rounded-full bg-navy-900" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
