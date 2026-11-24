"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavTabs } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/auth-provider";
import { getAccessToken, UNAUTHORIZED_REDIRECT } from "@/lib/api";
import { PREVIEW_MODE } from "@/lib/preview";

// Tab member hanya untuk customer.
// Role lain (super_admin, organizer, gate_staff) tidak butuh.
const MEMBER_TABS = [
  { href: "/tickets", label: "Tiket Saya" },
  { href: "/orders", label: "Riwayat Transaksi" },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (PREVIEW_MODE || isLoading || redirected.current) return;

    void (async () => {
      const token = await getAccessToken();
      if (!token || !user) {
        if (redirected.current) return;
        redirected.current = true;
        const next = encodeURIComponent(`${pathname}${window.location.search}`);
        router.replace(`${UNAUTHORIZED_REDIRECT}?next=${next}`);
      }
    })();
  }, [isLoading, pathname, router, user]);

  if (!PREVIEW_MODE && (isLoading || !user)) return null;

  const showMemberTabs = user?.role === "customer";

  return (
    <div className="page-container py-6">
      {showMemberTabs && <NavTabs items={MEMBER_TABS} />}
      <div className={showMemberTabs ? "mt-6" : undefined}>{children}</div>
    </div>
  );
}
