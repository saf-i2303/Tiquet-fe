"use client";

import { use, useEffect, useState } from "react";
import { Download, ScanLine, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { requireOwnedEvent } from "@/lib/ownership";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { attendeeStatusFilters, attendeeStatusMeta } from "@/lib/constants";
import { formatDateTime, percent } from "@/lib/utils";
import { getEventById } from "@/services/eventServices";
import { getEventAttendees } from "@/services/organizerServices";
import type { EventWithStats } from "@/types/event";
import type { Attendee } from "@/types/organizer";

export default function EventAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { id } = use(params);
  const { status = "", q = "" } = use(searchParams);
  const { user, isLoading } = useAuth();
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;

    Promise.all([getEventById(id, { includeUnpublished: true }), getEventAttendees(id)])
      .then(([eventData, attendeeList]) => {
        if (!active) return;
        setEvent(eventData ?? null);
        setAttendees(attendeeList);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        setAttendees([]);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isLoading, user]);

  const ownedEvent = event && user ? requireOwnedEvent(event, user) : null;
  if (isLoading || !user || isDataLoading || !ownedEvent) return null;
  const eventId = ownedEvent.id;

  function handleExport() {
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ["Nama", "Email", "Kategori Tiket", "Order", "Status", "Waktu Check-in"],
      ...attendees.map((attendee) => [
        attendee.name,
        attendee.email,
        attendee.ticketType,
        attendee.orderId,
        attendee.status === "checked_in" ? "Check-in" : "Belum check-in",
        attendee.checkedInAt ?? "",
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `peserta-${eventId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

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
      <BackLink href={`/organizer/events/${ownedEvent.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Data peserta"
        title={`Peserta · ${ownedEvent.title}`}
        subtitle="Pantau kehadiran peserta dan siapkan gate staff untuk proses check-in."
        className="mt-4"
        action={
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> Ekspor CSV
          </Button>
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
          href: `/organizer/events/${ownedEvent.id}/attendees${
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
