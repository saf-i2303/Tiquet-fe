import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Mail, ScanLine, ShieldCheck, Users } from "lucide-react";
import { InviteMemberForm } from "@/components/organizer/invite-member-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { memberRoleLabel, memberStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import {
  getOrganizerEvents,
  getOrganizerMembers,
} from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Tim & Petugas",
};

const permissions = [
  {
    role: "Manager",
    detail: "Kelola event, tiket, laporan, dan tim. Tidak bisa mengubah data pemilik.",
  },
  {
    role: "Staff",
    detail: "Membuat draft event, melihat peserta, dan memantau penjualan.",
  },
  {
    role: "Gate Staff",
    detail: "Scan QR, validasi tiket, dan melihat riwayat check-in event yang ditugaskan.",
  },
];

export default async function OrganizerTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const session = await requireRole("organizer", "/organizer/team");
  const { invited, error } = await searchParams;
  const organizerId = session.organizerId ?? "org-001";

  const [members, events] = await Promise.all([
    getOrganizerMembers(organizerId),
    getOrganizerEvents(organizerId),
  ]);

  const eventTitle = (eventId: string) =>
    events.find((event) => event.id === eventId)?.title ?? eventId;

  const gateStaff = members.filter((member) => member.role === "gate_staff");
  const invitedCount = members.filter((member) => member.status === "invited").length;

  return (
    <main>
      <PageHeader
        kicker="Kolaborasi"
        title="Tim & petugas"
        subtitle="Kelola akses anggota tim dan tugaskan gate staff untuk proses check-in."
      />

      {invited && (
        <Alert tone="success" className="mb-5">
          Undangan berhasil dikirim.
        </Alert>
      )}
      {error === "required" && (
        <Alert tone="danger" className="mb-5">
          Nama dan email anggota wajib diisi.
        </Alert>
      )}
      {error === "not-found" && (
        <Alert tone="danger" className="mb-5">
          Data organizer tidak ditemukan.
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatTile
          label="Total anggota"
          value={members.length}
          hint="Termasuk pemilik"
          icon={<Users className="h-4 w-4" />}
        />
        <StatTile
          label="Gate staff"
          value={gateStaff.length}
          hint="Petugas scan tiket"
          icon={<ScanLine className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Menunggu konfirmasi"
          value={invitedCount}
          hint="Undangan belum diterima"
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="section-stack">
          <InviteMemberForm />

          <Card className="overflow-hidden">
            <div className="p-5">
              <CardHeader
                title="Anggota tim"
                action={<span className="text-xs text-muted">{members.length} akun</span>}
              />
            </div>

            {members.length === 0 ? (
              <div className="p-5 pt-0">
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="Belum ada anggota"
                  description="Undang manager atau gate staff untuk membantu mengelola event."
                />
              </div>
            ) : (
              <TableShell>
                <table className="w-full min-w-[720px]">
                  <thead className="bg-surface">
                    <tr>
                      <th className="th">Anggota</th>
                      <th className="th">Peran</th>
                      <th className="th">Event ditugaskan</th>
                      <th className="th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="table-row">
                        <td className="td">
                          <div className="flex items-center gap-2">
                            <Avatar name={member.name} size="sm" />
                            <div className="min-w-0">
                              <div className="font-semibold text-navy-900">{member.name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted">
                                <Mail className="h-3 w-3" /> {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="td text-sm">
                          {memberRoleLabel[member.role] ?? member.role}
                        </td>
                        <td className="td">
                          {member.assignedEvents && member.assignedEvents.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {member.assignedEvents.map((eventId) => (
                                <Badge
                                  key={eventId}
                                  tone="slate"
                                  className="max-w-40 truncate"
                                >
                                  <Link
                                    href={`/organizer/events/${eventId}`}
                                    className="truncate hover:text-navy-700"
                                  >
                                    {eventTitle(eventId)}
                                  </Link>
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted">Semua event</span>
                          )}
                        </td>
                        <td className="td">
                          <StatusBadge value={member.status} map={memberStatusMeta} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Card>
        </section>

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-navy-600" /> Hak akses peran
                </span>
              }
            />
            <div className="mt-3 space-y-3">
              {permissions.map((permission) => (
                <div key={permission.role} className="rounded-control border border-line p-3">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                    <BadgeCheck className="h-3.5 w-3.5 text-navy-600" /> {permission.role}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{permission.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Gate staff" />
            {gateStaff.length === 0 ? (
              <EmptyState
                className="mt-3"
                title="Belum ada gate staff"
                description="Undang petugas untuk check-in tiket di venue."
              />
            ) : (
              <div className="mt-3 space-y-2">
                {gateStaff.map((member) => (
                  <div key={member.id} className="rounded-control border border-line px-3 py-2">
                    <div className="text-sm font-semibold text-navy-900">{member.name}</div>
                    <div className="text-xs text-muted">
                      {member.assignedEvents?.length ?? 0} event ditugaskan
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </main>
  );
}
