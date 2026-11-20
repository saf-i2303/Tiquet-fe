import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Pencil, Send, Ticket, TrendingUp, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { QuickLinksCard } from "@/components/shared/quick-links-card";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { EmptyState } from "@/components/ui/empty-state";
import { EventMeta } from "@/components/shared/event-meta";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { SummaryRow } from "@/components/ui/summary-row";
import { attendeeStatusMeta, categoryMeta, eventStatusMeta } from "@/lib/constants";
import { submitEventAction } from "@/lib/actions/organizer.action";
import { requireRole } from "@/lib/guards";
import { formatTime, percent } from "@/lib/utils";
import { getEventById } from "@/services/event.service";
import {
  getEventAttendees,
  getOrganizerTransactions,
} from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Detail Event",
};

export default async function OrganizerEventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; submitted?: string; error?: string }>;
}) {
  const session = await requireRole("organizer", "/organizer/events");
  const organizerId = session.organizerId ?? "org-001";
  const { id } = await params;
  const { saved, submitted, error } = await searchParams;

  const event = await getEventById(id, { includeUnpublished: true });
  if (!event) notFound();

  const [transactions, attendees] = await Promise.all([
    getOrganizerTransactions(organizerId),
    getEventAttendees(event.id),
  ]);

  const eventOrders = transactions.filter((order) => order.eventId === event.id);
  const revenue = eventOrders
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.total, 0);
  const checkedIn = attendees.filter((attendee) => attendee.status === "checked_in").length;
  const meta = categoryMeta[event.category];

  // One notice only: highest-priority tone first (danger → success → info).
  const notices: { tone: "danger" | "success" | "info"; text: string }[] = [];
  if (error === "tickets") {
    notices.push({
      tone: "danger",
      text: "Tambahkan minimal satu kategori tiket sebelum mengajukan moderasi.",
    });
  }
  if (event.status === "rejected") {
    notices.push({
      tone: "danger",
      text: "Event ditolak moderasi. Perbaiki informasi event lalu ajukan ulang.",
    });
  }
  if (submitted) {
    notices.push({
      tone: "success",
      text: "Event berhasil diajukan untuk moderasi. Super admin akan meninjau sebelum event tayang.",
    });
  }
  if (saved) {
    notices.push({ tone: "success", text: "Perubahan event berhasil disimpan." });
  }
  if (event.status === "pending") {
    notices.push({
      tone: "info",
      text: "Event sedang menunggu moderasi super admin. Kamu masih bisa melengkapi informasi event.",
    });
  }
  const notice = notices[0];

  return (
    <main>
      <DetailHeader
        backHref="/organizer/events"
        backLabel="Kembali ke daftar event"
        title={event.title}
        badge={
          <>
            <Badge tone="gold">{meta.label}</Badge>
            <StatusBadge value={event.status} map={eventStatusMeta} />
          </>
        }
        subtitle={
          <EventMeta
            date={event.date}
            time={event.date}
            venue={event.venue}
            city={event.city}
          />
        }
        actions={
          <>
            <ButtonLink href={`/organizer/events/${event.id}/edit`} size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit event
            </ButtonLink>
            {event.status === "published" && (
              <ButtonLink href={`/events/${event.id}`} variant="outline" size="sm">
                Lihat publik <ArrowUpRight className="h-3.5 w-3.5" />
              </ButtonLink>
            )}
            {(event.status === "draft" || event.status === "rejected") && (
              <form action={submitEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button type="submit" size="sm">
                  <Send className="h-3.5 w-3.5" /> Ajukan moderasi
                </Button>
              </form>
            )}
          </>
        }
      />

      {notice && <Alert tone={notice.tone} className="mb-6">{notice.text}</Alert>}

      <div className="stat-grid">
        <StatTile
          label="Tiket terjual"
          value={event.totalSold.toLocaleString("id-ID")}
          hint={`dari ${event.totalQuota.toLocaleString("id-ID")} kuota`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Pendapatan"
          value={<Price value={revenue} />}
          hint="Dari order lunas"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Peserta check-in"
          value={checkedIn}
          hint={`${attendees.length} peserta terdaftar`}
          icon={<Users className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Transaksi"
          value={eventOrders.length}
          hint="Semua status order"
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-stack">
          <Card className="p-5">
            <CardHeader
              title="Kategori tiket"
              action={
                <Link
                  href={`/organizer/events/${event.id}/tickets`}
                  className="text-xs font-semibold text-navy-900 hover:underline"
                >
                  Kelola tiket
                </Link>
              }
            />

            {event.ticketTypes.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="Belum ada kategori tiket"
                action={
                  <ButtonLink href={`/organizer/events/${event.id}/tickets`} size="sm">
                    Tambahkan sekarang
                  </ButtonLink>
                }
              />
            ) : (
              <div className="mt-4 space-y-3">
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="rounded-control border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-navy-900">{ticket.name}</div>
                        <p className="mt-0.5 text-sm text-muted">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <Price value={ticket.price} />
                        <div className="text-xs text-muted">
                          Maks. {ticket.maxPerOrder} / transaksi
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={ticket.sold} total={ticket.quota} label={ticket.name} />
                    </div>
                    {ticket.benefits.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-800">
                        {ticket.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-navy-600" strokeWidth={3} /> {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <CardHeader title="Deskripsi event" />
            <p className="body-copy mt-2 text-navy-800">
              {event.description || "Belum ada deskripsi."}
            </p>
            <div className="mt-4 space-y-2">
              <SummaryRow label="Alamat lengkap">{event.address}</SummaryRow>
              <SummaryRow label="Rentang acara">
                {formatTime(event.date)}
                {event.endDate ? ` – ${formatTime(event.endDate)}` : ""}
              </SummaryRow>
            </div>
          </Card>
        </div>

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title="Peserta terbaru"
              action={
                <Link
                  href={`/organizer/events/${event.id}/attendees`}
                  className="text-xs font-semibold text-navy-900 hover:underline"
                >
                  Semua
                </Link>
              }
            />
            <div className="mt-3 space-y-2">
              {attendees.slice(0, 4).map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between gap-2 rounded-control border border-line px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={attendee.name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-navy-900">
                        {attendee.name}
                      </div>
                      <div className="text-xs text-muted">{attendee.ticketType}</div>
                    </div>
                  </div>
                  <StatusBadge value={attendee.status} map={attendeeStatusMeta} />
                </div>
              ))}
              {attendees.length === 0 && (
                <EmptyState className="px-3 py-6" title="Belum ada peserta terdaftar" />
              )}
            </div>
          </Card>

          <QuickLinksCard
            items={[
              {
                href: `/organizer/events/${event.id}/tickets`,
                label: "Kelola kategori tiket",
                icon: <Ticket className="h-3.5 w-3.5" />,
              },
              {
                href: `/organizer/events/${event.id}/attendees`,
                label: "Lihat data peserta",
                icon: <Users className="h-3.5 w-3.5" />,
              },
              {
                href: `/organizer/events/${event.id}/edit`,
                label: "Edit informasi event",
                icon: <Pencil className="h-3.5 w-3.5" />,
              },
            ]}
          />

          <Card className="p-5">
            <CardHeader title="Ringkasan penjualan" />
            <div className="mt-3 space-y-2">
              <SummaryRow label="Harga mulai">
                <Price value={event.minPrice} short />
              </SummaryRow>
              <SummaryRow label="Terjual">
                {percent(event.totalSold, event.totalQuota)}%
              </SummaryRow>
              <SummaryRow label="Order lunas">
                {eventOrders.filter((order) => order.status === "paid").length}
              </SummaryRow>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
