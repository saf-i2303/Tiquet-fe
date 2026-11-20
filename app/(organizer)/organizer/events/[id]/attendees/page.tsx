import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, ScanLine, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { attendeeStatusFilters, attendeeStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatDateTime, percent } from "@/lib/utils";
import { getEventById } from "@/services/event.service";
import { getEventAttendees } from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Data Peserta",
};

export default async function EventAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("organizer", "/organizer/events");
  const { id } = await params;
  const { status = "", q = "" } = await searchParams;

  const event = await getEventById(id, { includeUnpublished: true });
  if (!event) notFound();

  const attendees = await getEventAttendees(event.id);
  const needle = q.trim().toLowerCase();
  const filtered = attendees.filter((attendee) => {
    const matchStatus = !status || attendee.status === status;
    const matchQuery =
      !needle ||
      attendee.name.toLowerCase().includes(needle) ||
      attendee.email.toLowerCase().includes(needle) ||
      attendee.orderId.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const checkedIn = attendees.filter((attendee) => attendee.status === "checked_in").length;
  const remaining = attendees.length - checkedIn;

  return (
    <main>
      <BackLink href={`/organizer/events/${event.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Data peserta"
        title={`Peserta · ${event.title}`}
        subtitle="Pantau kehadiran peserta dan siapkan gate staff untuk proses check-in."
        className="mt-4"
        action={
          <ButtonLink
            href={`/organizer/events/${event.id}/attendees/export`}
            variant="outline"
            size="sm"
          >
            <Download className="h-3.5 w-3.5" /> Ekspor CSV
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatTile
          label="Total peserta"
          value={attendees.length}
          hint="Pemegang tiket"
          icon={<Users className="h-4 w-4" />}
        />
        <StatTile
          label="Sudah check-in"
          value={checkedIn}
          hint={`${percent(checkedIn, attendees.length)}% kehadiran`}
          icon={<ScanLine className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Belum check-in"
          value={remaining}
          hint="Perlu di-scan di gate"
          tone="gold"
        />
      </div>

      <FilterBar
        chips={attendeeStatusFilters.map((filter) => ({
          label: filter.label,
          href: `/organizer/events/${event.id}/attendees${
            filter.value ? `?status=${filter.value}` : ""
          }`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Nama, email, order..."
        defaultValue={q}
        hidden={{ status }}
        className="mb-5"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Peserta tidak ditemukan"
          description={
            attendees.length === 0
              ? "Peserta akan muncul di sini setelah ada order lunas untuk event ini."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[820px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">Nama peserta</th>
                  <th className="th">Kategori</th>
                  <th className="th">Order</th>
                  <th className="th">Status</th>
                  <th className="th">Waktu check-in</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((attendee) => (
                  <tr key={attendee.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <Avatar name={attendee.name} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-navy-900">{attendee.name}</div>
                          <div className="text-xs text-muted">{attendee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td text-sm">{attendee.ticketType}</td>
                    <td className="td font-mono text-xs">{attendee.orderId}</td>
                    <td className="td">
                      <StatusBadge value={attendee.status} map={attendeeStatusMeta} />
                    </td>
                    <td className="td text-xs text-muted">
                      {attendee.checkedInAt ? formatDateTime(attendee.checkedInAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Card>
      )}
    </main>
  );
}
