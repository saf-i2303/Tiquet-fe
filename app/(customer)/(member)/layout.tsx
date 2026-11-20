import { NavTabs } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/guards";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/tickets");

  return (
    <div className="page-container py-6">
      <NavTabs
        items={[
          { href: "/tickets", label: "Tiket Saya" },
          { href: "/orders", label: "Riwayat Transaksi" },
        ]}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
