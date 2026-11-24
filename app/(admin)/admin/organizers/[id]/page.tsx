"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatTile } from "@/components/ui/stat-tile";
import { SummaryRow } from "@/components/ui/summary-row";
import { TableShell } from "@/components/ui/table-shell";
import { getApiErrorMessage } from "@/lib/api";
import {
  documentStatusMeta,
  eventStatusMeta,
  memberRoleLabel,
  organizerStatusMeta,
} from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";
import {
  getAllEvents,
  getOrganizerById,
  rejectOrganizer,
  verifyOrganizer,
} from "@/services/adminServices";

export default function AdminOrganizerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Awaited<ReturnType<typeof getOrganizerById>>>(undefined);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getAllEvents>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getOrganizerById(id), getAllEvents()])
      .then(([nextOrganizer, nextEvents]) => {
        if (!active) return;
        setOrganizer(nextOrganizer);
        setEvents(nextEvents);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setOrganizer(undefined);
        setEvents([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleDecision(decision: "verified" | "rejected") {
    setErrorMsg("");
    try {
      if (decision === "verified") {
        await verifyOrganizer(id);
      } else {
        const reason = window.prompt("Alasan penolakan organizer:");
        if (reason === null || !reason.trim()) return;
        await rejectOrganizer(id, reason.trim());
      }
      setOrganizer((current) => (current ? { ...current, status: decision } : current));
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menyimpan keputusan verifikasi."));
    }
  }

  if (isLoading) {
    return (
      <main>
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      </main>
    );
  }
  if (errorMsg) {
    return (
      <main>
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      </main>
    );
  }
  if (!organizer) notFound();

  const organizerEvents = events.filter((event) => event.organizerId === organizer.id);
  const pendingDocuments = organizer.documents.filter(
    (document) => document.status === "pending",
  ).length;

  return (
    <main>
      <DetailHeader
        backHref="/admin/organizers"
        backLabel="Kembali ke daftar organizer"
        title={organizer.name}
        subtitle={`${organizer.ownerName} · ${organizer.city} · bergabung ${formatDate(organizer.joinedAt)}`}
        badge={<StatusBadge value={organizer.status} map={organizerStatusMeta} />}
        actions={
          <>
            {organizer.status !== "verified" && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleDecision("verified")}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Setujui
              </Button>
            )}
            {organizer.status !== "rejected" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-danger"
                onClick={() => handleDecision("rejected")}
              >
                Tolak
              </Button>
            )}
          </>
        }
      />

      {pendingDocuments > 0 && (
        <Alert tone="warning" className="mb-4">
          Ada {pendingDocuments} dokumen yang belum ditinjau. Pastikan dokumen valid sebelum
          menyetujui.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total event"
          value={organizerEvents.length}
          hint="Semua status"
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatTile
          label="Event tayang"
          value={organizerEvents.filter((event) => event.status === "published").length}
          hint="Aktif dijual"
          tone="green"
        />
        <StatTile
          label="Anggota tim"
          value={organizer.members.length}
          hint="Termasuk owner"
          icon={<Users className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile label="GMV" value={formatRupiah(organizer.revenue)} hint="Akumulasi" tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-navy-600" /> Profil organizer
                </span>
              }
            />
            <p className="body-copy mt-2 text-navy-800">
              {organizer.description || "Belum ada deskripsi."}
            </p>
            <div className="mt-4 space-y-2">
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-navy-600" /> Email
                  </span>
                }
              >
                <span className="block max-w-[12rem] truncate">{organizer.email}</span>
              </SummaryRow>
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-navy-600" /> Telepon
                  </span>
                }
              >
                {organizer.phone}
              </SummaryRow>
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-navy-600" /> Kota
                  </span>
                }
              >
                {organizer.city}
              </SummaryRow>
            </div>
            {organizer.verifiedAt && (
              <p className="mt-3 rounded-control bg-success-soft px-3 py-2 text-xs font-semibold text-success">
                Terverifikasi {formatDate(organizer.verifiedAt)}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-navy-600" /> Dokumen
                </span>
              }
            />
            <div className="mt-3 space-y-2">
              {organizer.documents.length === 0 ? (
                <EmptyState
                  title="Belum ada dokumen diunggah."
                  className="border-0 bg-transparent px-0 py-4"
                />
              ) : (
                organizer.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-2 rounded-control border border-line px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-navy-900">{document.type}</div>
                      <div className="truncate text-xs text-muted">{document.name}</div>
                    </div>
                    <StatusBadge value={document.status} map={documentStatusMeta} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Anggota tim" />
            <div className="mt-3 space-y-2">
              {organizer.members.map((member) => (
                <div key={member.id} className="rounded-control border border-line px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-navy-900">{member.name}</span>
                    <span className="text-xs text-muted">
                      {memberRoleLabel[member.role] ?? member.role}
                    </span>
                  </div>
                  <div className="truncate text-xs text-muted">{member.email}</div>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <Card className="overflow-hidden">
          <CardHeader
            title="Event organizer"
            className="p-4"
            action={<span className="text-xs text-muted">{organizerEvents.length} event</span>}
          />
          {organizerEvents.length === 0 ? (
            <EmptyState title="Organizer ini belum membuat event." className="m-4" />
          ) : (
            <TableShell>
              <table className="w-full min-w-[640px]">
                <thead className="bg-surface">
                  <tr>
                    <th className="th">Event</th>
                    <th className="th">Tanggal</th>
                    <th className="th">Terjual</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {organizerEvents.map((event) => (
                    <tr key={event.id} className="table-row">
                      <td className="td">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="block max-w-64 truncate font-semibold text-navy-900 hover:text-navy-700"
                        >
                          {event.title}
                        </Link>
                        <div className="text-xs text-muted">
                          {event.venue} · {event.city}
                        </div>
                      </td>
                      <td className="td text-xs text-muted">
                        {formatDate(event.date, { dateStyle: "medium" })}
                      </td>
                      <td className="td text-sm">
                        {event.totalSold.toLocaleString("id-ID")} /{" "}
                        {event.totalQuota.toLocaleString("id-ID")}
                      </td>
                      <td className="td">
                        <StatusBadge value={event.status} map={eventStatusMeta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}

          <div className="border-t border-line bg-surface px-4 py-3">
            <ButtonLink href="/admin/organizers" variant="ghost" size="sm">
              <BadgeCheck className="h-3.5 w-3.5" /> Selesai review, kembali ke daftar
            </ButtonLink>
          </div>
        </Card>
      </div>
    </main>
  );
}
