import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Check, ShieldCheck, Ticket, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { moderateEventAction } from "@/lib/actions/admin.action";
import { categoryMeta, eventStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatDate } from "@/lib/utils";
import { getAllEvents } from "@/services/admin.service";

export const metadata: Metadata = {
  title: "Moderasi Event",
};

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "published", label: "Tayang" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Ditolak" },
  { value: "ended", label: "Selesai" },
];

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; saved?: string }>;
}) {
  await requireRole("super_admin", "/admin/events");
  const { status = "", q = "", saved } = await searchParams;
  const events = await getAllEvents();

  const needle = q.trim().toLowerCase();
  const filtered = events.filter((event) => {
    const matchStatus = !status || event.status === status;
    const matchQuery =
      !needle ||
      event.title.toLowerCase().includes(needle) ||
      event.organizerName.toLowerCase().includes(needle) ||
      event.city.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const pending = events.filter((event) => event.status === "pending").length;
  const published = events.filter((event) => event.status === "published").length;
  const ticketsSold = events.reduce((total, event) => total + event.totalSold, 0);

  return (
    <main>
      <PageHeader
        kicker="Moderasi konten"
        title="Moderasi event"
        subtitle="Tinjau event baru sebelum tayang di marketplace. Pastikan informasi dan tiket valid."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Keputusan moderasi event berhasil disimpan.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total event"
          value={events.length}
          hint="Semua status"
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatTile
          label="Menunggu moderasi"
          value={pending}
          hint="Perlu ditinjau"
          tone="gold"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatTile label="Tayang" value={published} hint="Aktif dijual" tone="green" />
        <StatTile
          label="Tiket terjual"
          value={ticketsSold.toLocaleString("id-ID")}
          hint="Seluruh platform"
          icon={<Ticket className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={statusFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/events${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Event, organizer, kota..."
        defaultValue={q}
        hidden={{ status }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Event tidak ditemukan"
          description="Coba ubah filter status atau kata kunci pencarian."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => (
            <Card key={event.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="type-subhead truncate text-navy-900 transition hover:text-navy-700"
                    >
                      {event.title}
                    </Link>
                    <StatusBadge value={event.status} map={eventStatusMeta} />
                    <Badge tone="slate" className="uppercase tracking-wide">
                      {categoryMeta[event.category]?.label ?? event.category}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span>{event.organizerName}</span>
                    <span>
                      {formatDate(event.date, { dateStyle: "medium" })} · {event.venue}
                    </span>
                    <span>
                      {event.totalSold.toLocaleString("id-ID")} /{" "}
                      {event.totalQuota.toLocaleString("id-ID")} tiket terjual
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink
                    href={`/admin/events/${event.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Review
                  </ButtonLink>
                  {event.status === "pending" && (
                    <>
                      <form action={moderateEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="decision" value="published" />
                        <Button size="sm">
                          <Check className="h-3.5 w-3.5" /> Setujui
                        </Button>
                      </form>
                      <form action={moderateEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="decision" value="rejected" />
                        <Button variant="danger" size="sm">
                          <X className="h-3.5 w-3.5" /> Tolak
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
