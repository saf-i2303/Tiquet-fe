import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/constants";

const keyByTone: Record<string, "info" | "success" | "warning" | "danger"> = {
  blue: "info",
  info: "info",
  green: "success",
  success: "success",
  amber: "warning",
  warning: "warning",
  red: "danger",
  danger: "danger",
};

const tones = {
  info: {
    className: "border-info/20 bg-info-soft text-info",
    icon: <Info className="h-4 w-4" />,
  },
  success: {
    className: "border-success/20 bg-success-soft text-success",
    icon: <CircleCheck className="h-4 w-4" />,
  },
  warning: {
    className: "border-warning/20 bg-warning-soft text-warning",
    icon: <TriangleAlert className="h-4 w-4" />,
  },
  danger: {
    className: "border-danger/20 bg-danger-soft text-danger",
    icon: <CircleAlert className="h-4 w-4" />,
  },
} as const;

type AlertTone = Extract<Tone, "blue" | "green" | "amber" | "red"> | keyof typeof tones;

export function Alert({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: AlertTone;
  className?: string;
}) {
  const config = tones[keyByTone[tone] ?? "info"];

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-control border px-4 py-3 text-sm",
        config.className,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div>{children}</div>
    </div>
  );
}
