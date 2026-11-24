"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import type { NavItem } from "@/config/navigation";
import {
  clearTokens,
  getAccessToken,
  UNAUTHORIZED_REDIRECT,
} from "@/lib/api";
import type { Role } from "@/types/user";

function isTokenExpired(token: string): boolean {
  try {
    const segment = token.split(".")[1];
    if (!segment) return false;
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    return typeof payload.exp === "number"
      ? payload.exp * 1000 <= Date.now()
      : false;
  } catch {
    return false;
  }
}

/**
 * Guard client-side untuk area dashboard.
 *
 * Tidak membaca cookie dan tidak memanggil /auth/me: token serta data user
 * di localStorage (lewat AuthProvider) yang jadi sumber keputusan.
 * Backend tetap otoritas akhir untuk pembatasan role.
 */
export function ClientAuthGuard({
  nav,
  roleLabel,
  requiredRole,
  children,
}: {
  nav: NavItem[];
  roleLabel: string;
  requiredRole?: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading || redirected.current) return;

    const redirectToLogin = () => {
      if (redirected.current) return;
      redirected.current = true;
      const next = encodeURIComponent(`${pathname}${window.location.search}`);
      router.replace(`${UNAUTHORIZED_REDIRECT}?next=${next}`);
    };

    void (async () => {
      const token = await getAccessToken();
      if (!token || isTokenExpired(token)) {
        clearTokens();
        redirectToLogin();
        return;
      }

      if (!user) {
        redirectToLogin();
        return;
      }

      const hasRequiredRole =
        !requiredRole ||
        user.role === requiredRole ||
        Boolean(user.roles?.includes(requiredRole));
      if (!hasRequiredRole) {
        redirected.current = true;
        router.replace(user.role === "organizer" ? "/organizer" : "/events");
      }
    })();
  }, [isLoading, user, pathname, requiredRole, router]);

  // Sembunyikan shell sampai data user terbaca agar tidak kedip sebagai Guest.
  if (isLoading || !user) return null;

  return (
    <DashboardShell user={user} nav={nav} roleLabel={roleLabel}>
      {children}
    </DashboardShell>
  );
}
