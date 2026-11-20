"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  max = 10,
  min = 0,
  disabled,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  return (
    <div className="flex items-center gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        className="grid h-8 w-8 place-items-center rounded-control border border-line text-navy-900 transition hover:border-navy-900/25 disabled:opacity-40"
        aria-label="Kurangi jumlah"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums text-navy-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        className="grid h-8 w-8 place-items-center rounded-control border border-line text-navy-900 transition hover:border-navy-900/25 disabled:opacity-40"
        aria-label="Tambah jumlah"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
