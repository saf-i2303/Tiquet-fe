"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { adminNav } from "@/config/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed =
    user?.role === "super_admin" || Boolean(user?.roles?.includes("super_admin"));

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowed) {
      router.replace(user.role === "organizer" ? "/organizer" : "/events");
    }
  }, [allowed, isLoading, pathname, router, user]);

  // Jangan render shell sebelum data user terbaca (mencegah kedip/akses guest).
  if (isLoading || !user || !allowed) return null;

  return (
    <DashboardShell user={user} nav={adminNav} roleLabel="Super Admin">
      {children}
    </DashboardShell>
  );
}
