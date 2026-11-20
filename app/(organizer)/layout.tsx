import { DashboardShell } from "@/components/layout/dashboard-layout";
import { organizerNav } from "@/config/navigation";
import { requireRole } from "@/lib/guards";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("organizer", "/organizer");

  return (
    <DashboardShell user={session} nav={organizerNav} roleLabel="Organizer Dashboard">
      {children}
    </DashboardShell>
  );
}
