"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { organizerNav } from "@/config/navigation";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed =
    user?.role === "organizer" || Boolean(user?.roles?.includes("organizer"));

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowed) {
      router.replace(user.role === "super_admin" ? "/admin" : "/events");
    }
  }, [allowed, isLoading, pathname, router, user]);

  // Jangan render shell sebelum data user terbaca (mencegah kedip/akses guest).
  if (isLoading || !user || !allowed) return null;

  return (
    <DashboardShell user={user} nav={organizerNav} roleLabel="Event Organizer">
      {children}
    </DashboardShell>
  );
}
