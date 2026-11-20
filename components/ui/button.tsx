import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "navy" | "outline" | "ghost" | "pop" | "popGhost" | "popNavy" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  gold: "btn-gold",
  navy: "btn-navy",
  outline: "btn-outline",
  ghost: "btn-ghost",
  // Legacy aliases kept so existing call sites keep working.
  pop: "btn-gold",
  popGhost: "btn-gold-ghost",
  popNavy: "btn-gold-navy",
  danger: "btn-danger",
};

const sizes: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function buttonStyles({
  variant = "gold",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(variants[variant], sizes[size], className);
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export type { Variant as ButtonVariant, Size as ButtonSize };
