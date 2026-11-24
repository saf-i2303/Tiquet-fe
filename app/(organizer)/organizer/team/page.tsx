"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Mail, ScanLine, ShieldCheck, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { InviteMemberForm } from "@/components/organizer/invite-member-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { memberRoleLabel, memberStatusMeta } from "@/lib/constants";
import { getApiErrorMessage } from "@/lib/api";
import { requireOrganizerId } from "@/lib/ownership";
import {
  deleteStaff,
  getOrganizerEvents,
  getOrganizerMembers,
} from "@/services/organizerServices";
import type { EventWithStats } from "@/types/event";
import type { OrganizerMember } from "@/types/organizer";

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

export default function OrganizerTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const { invited, error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<OrganizerMember[]>([]);
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [invitedLocally, setInvitedLocally] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    Promise.all([
      getOrganizerMembers(organizerId),
      getOrganizerEvents(organizerId),
    ])
      .then(([memberList, eventList]) => {
        if (!active) return;
        setMembers(memberList);
        setEvents(eventList);
      })
      .catch(() => {
        if (!active) return;
        setMembers([]);
        setEvents([]);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user || isDataLoading) return null;

  function handleInvited() {
    setInvitedLocally(true);
    const organizerId = requireOrganizerId(user!);
    getOrganizerMembers(organizerId)
      .then((data) => setMembers(data))
      .catch(() => undefined);
    router.refresh();
  }

  async function handleDeleteStaff(userId: string) {
    if (!window.confirm("Hapus anggota tim ini? Aksesnya akan dicabut.")) return;
    setDeletingId(userId);
    setActionError("");
    try {
      await deleteStaff(userId);
      const organizerId = requireOrganizerId(user!);
      const data = await getOrganizerMembers(organizerId);
      setMembers(data);
      router.refresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Gagal menghapus anggota tim."));
    } finally {
      setDeletingId("");
    }
  }

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

      {(invited || invitedLocally) && (
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
      {actionError && (
        <Alert tone="danger" className="mb-5">
          {actionError}
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
          <InviteMemberForm onInvited={handleInvited} />

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
                      <th className="th">Aksi</th>
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
                        <td className="td">
                          {member.role !== "owner" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStaff(member.id)}
                              disabled={deletingId === member.id}
                              aria-label={`Hapus ${member.name}`}
                            >
                              <Trash2 className="h-4 w-4 text-danger" />
                            </Button>
                          )}
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
