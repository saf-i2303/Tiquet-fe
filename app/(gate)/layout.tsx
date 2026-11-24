"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import type { NavItem } from "@/config/navigation";

const gateNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/scan", label: "Scan Tiket", icon: "ticket" },
];

export default function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: Jika backend belum mengirim role gate_staff, guard sementara bisa
  // hanya mengecek login (user ada) dan izinkan akses halaman gate.
  const allowed =
    user?.role === "gate_staff" || Boolean(user?.roles?.includes("gate_staff"));

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowed) {
      if (user.role === "super_admin") {
        router.replace("/admin");
        return;
      }
      if (user.role === "organizer") {
        router.replace("/organizer");
        return;
      }
      router.replace("/events");
    }
  }, [allowed, isLoading, pathname, router, user]);

  // Jangan render shell sebelum data user terbaca (mencegah kedip/akses guest).
  if (isLoading || !user || !allowed) return null;

  return (
    <DashboardShell user={user} nav={gateNav} roleLabel="Gate Staff">
      {children}
    </DashboardShell>
  );
}
