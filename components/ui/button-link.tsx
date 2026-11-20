import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

/**
 * Link that looks exactly like <Button>. Use it whenever navigation should
 * carry the same visual weight as an action button.
 */
export function ButtonLink({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
