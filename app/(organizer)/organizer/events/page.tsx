import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus, Ticket, Users } from "lucide-react";
import { EventMeta } from "@/components/shared/event-meta";
import { StatusBadge } from "@/components/shared/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { eventStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { getOrganizerEvents } from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Event Saya",
};

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "published", label: "Tayang" },
  { value: "pending", label: "Moderasi" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Ditolak" },
  { value: "ended", label: "Selesai" },
];

export default async function OrganizerEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireRole("organizer", "/organizer/events");
  const { status = "", q = "" } = await searchParams;
  const organizerId = session.organizerId ?? "org-001";
  const events = await getOrganizerEvents(organizerId);

  const needle = q.trim().toLowerCase();
  const filtered = events.filter((event) => {
    const matchStatus = !status || event.status === status;
    const matchQuery =
      !needle ||
      event.title.toLowerCase().includes(needle) ||
      event.city.toLowerCase().includes(needle) ||
      event.venue.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const ticketsSold = events.reduce((total, event) => total + event.totalSold, 0);
  const published = events.filter((event) => event.status === "published").length;
  const pending = events.filter((event) => event.status === "pending").length;

  return (
    <main>
      <PageHeader
        kicker="Manajemen event"
        title="Event saya"
        subtitle="Buat, atur, dan pantau semua event yang kamu selenggarakan."
        action={
          <ButtonLink href="/organizer/events/new" size="sm">
            <Plus className="h-4 w-4" /> Buat event
          </ButtonLink>
        }
      />

      <div className="stat-grid mb-6">
        <StatTile label="Total event" value={events.length} hint="Semua status" />
        <StatTile
          label="Tayang"
          value={published}
          hint="Bisa dibeli pembeli"
          tone="green"
        />
        <StatTile
          label="Menunggu moderasi"
          value={pending}
          hint="Ditinjau super admin"
          tone="gold"
        />
        <StatTile
          label="Tiket terjual"
          value={ticketsSold.toLocaleString("id-ID")}
          hint="Dari seluruh event"
          icon={<Ticket className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <FilterBar
        chips={statusFilters.map((filter) => ({
          label: filter.label,
          href: `/organizer/events${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Cari event..."
        defaultValue={q}
        hidden={{ status }}
        className="mb-5"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title={events.length === 0 ? "Belum ada event" : "Event tidak ditemukan"}
          description={
            events.length === 0
              ? "Mulai dengan membuat event pertamamu, lalu tambahkan kategori tiket."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
          action={
            <ButtonLink href="/organizer/events/new" size="sm">
              Buat event baru
            </ButtonLink>
          }
        />
      ) : (
        <div className="section-stack">
          {filtered.map((event) => (
            <Card key={event.id} className="p-5">
              <CardHeader
                title={
                  <Link
                    href={`/organizer/events/${event.id}`}
                    className="type-subhead text-navy-900 transition hover:text-navy-700"
                  >
                    {event.title}
                  </Link>
                }
                action={<StatusBadge value={event.status} map={eventStatusMeta} />}
              />

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <EventMeta date={event.date} venue={event.venue} city={event.city} />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <Users className="h-4 w-4 shrink-0 text-navy-600" aria-hidden="true" />
                  {event.ticketTypes.length} kategori tiket
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 flex-1 sm:max-w-md">
                  <Progress value={event.totalSold} total={event.totalQuota} />
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="text-right">
                    <div className="text-xs text-muted">Mulai dari</div>
                    <Price value={event.minPrice} short />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/organizer/events/${event.id}`}
                      variant="outline"
                      size="sm"
                    >
                      Detail
                    </ButtonLink>
                    <ButtonLink
                      href={`/organizer/events/${event.id}/tickets`}
                      variant="outline"
                      size="sm"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Tiket
                    </ButtonLink>
                    <ButtonLink
                      href={`/organizer/events/${event.id}/attendees`}
                      variant="navy"
                      size="sm"
                    >
                      <Users className="h-3.5 w-3.5" /> Peserta
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
