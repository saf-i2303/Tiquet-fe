"use client";

import { SiteFooter } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";

/** Shell publik yang membaca session dari context klien (tanpa /auth/me). */
export function CustomerShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const session = user ?? (PREVIEW_MODE ? previewSession("customer") : null);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session} loading={isLoading && !PREVIEW_MODE} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
