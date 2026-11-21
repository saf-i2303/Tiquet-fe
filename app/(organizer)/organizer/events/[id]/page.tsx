"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Pencil, Send, Ticket, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
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
import { requireOrganizerId, requireOwnedEvent } from "@/lib/ownership";
import { formatTime, percent } from "@/lib/utils";
import { getEventById, setEventStatus } from "@/services/eventServices";
import {
  getEventAttendees,
  getOrganizerTransactions,
} from "@/services/organizerServices";
import type { EventWithStats } from "@/types/event";
import type { Order } from "@/types/order";
import type { Attendee } from "@/types/organizer";

export default function OrganizerEventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; submitted?: string; error?: string }>;
}) {
  const { id } = use(params);
  const { saved, submitted, error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [submittedLocally, setSubmittedLocally] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    Promise.all([
      getEventById(id, { includeUnpublished: true }),
      getOrganizerTransactions(organizerId),
      getEventAttendees(id),
    ])
      .then(([eventData, orderList, attendeeList]) => {
        if (!active) return;
        setEvent(eventData ?? null);
        setTransactions(orderList);
        setAttendees(attendeeList);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        setTransactions([]);
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

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    try {
      await setEventStatus(eventId, "pending");
      setSubmittedLocally(true);
      setEvent((current) => (current ? { ...current, status: "pending" } : current));
      router.refresh();
    } catch (submitError) {
      window.alert(
        submitError instanceof Error ? submitError.message : "Gagal mengajukan moderasi.",
      );
    }
  }

  const eventOrders = transactions.filter((order) => order.eventId === ownedEvent.id);
  const revenue = eventOrders
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.total, 0);
  const checkedIn = attendees.filter((attendee) => attendee.status === "checked_in").length;
  const meta = categoryMeta[ownedEvent.category];

  // One notice only: highest-priority tone first (danger → success → info).
  const notices: { tone: "danger" | "success" | "info"; text: string }[] = [];
  if (error === "tickets") {
    notices.push({
      tone: "danger",
      text: "Tambahkan minimal satu kategori tiket sebelum mengajukan moderasi.",
    });
  }
  if (ownedEvent.status === "rejected") {
    notices.push({
      tone: "danger",
      text: "Event ditolak moderasi. Perbaiki informasi event lalu ajukan ulang.",
    });
  }
  if (submitted || submittedLocally) {
    notices.push({
      tone: "success",
      text: "Event berhasil diajukan untuk moderasi. Super admin akan meninjau sebelum event tayang.",
    });
  }
  if (saved) {
    notices.push({ tone: "success", text: "Perubahan event berhasil disimpan." });
  }
  if (ownedEvent.status === "pending") {
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
        title={ownedEvent.title}
        badge={
          <>
            <Badge tone="gold">{meta.label}</Badge>
            <StatusBadge value={ownedEvent.status} map={eventStatusMeta} />
          </>
        }
        subtitle={
          <EventMeta
            date={ownedEvent.date}
            time={ownedEvent.date}
            venue={ownedEvent.venue}
            city={ownedEvent.city}
          />
        }
        actions={
          <>
            <ButtonLink href={`/organizer/events/${ownedEvent.id}/edit`} size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit event
            </ButtonLink>
            {ownedEvent.status === "published" && (
              <ButtonLink href={`/events/${ownedEvent.id}`} variant="outline" size="sm">
                Lihat publik <ArrowUpRight className="h-3.5 w-3.5" />
              </ButtonLink>
            )}
            {(ownedEvent.status === "draft" || ownedEvent.status === "rejected") && (
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="eventId" value={ownedEvent.id} />
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
          value={ownedEvent.totalSold.toLocaleString("id-ID")}
          hint={`dari ${ownedEvent.totalQuota.toLocaleString("id-ID")} kuota`}
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
                  href={`/organizer/events/${ownedEvent.id}/tickets`}
                  className="text-xs font-semibold text-navy-900 hover:underline"
                >
                  Kelola tiket
                </Link>
              }
            />

            {ownedEvent.ticketTypes.length === 0 ? (
              <EmptyState
                className="mt-4"
                title="Belum ada kategori tiket"
                action={
                  <ButtonLink href={`/organizer/events/${ownedEvent.id}/tickets`} size="sm">
                    Tambahkan sekarang
                  </ButtonLink>
                }
              />
            ) : (
              <div className="mt-4 space-y-3">
                {ownedEvent.ticketTypes.map((ticket) => (
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
              {ownedEvent.description || "Belum ada deskripsi."}
            </p>
            <div className="mt-4 space-y-2">
              <SummaryRow label="Alamat lengkap">{ownedEvent.address}</SummaryRow>
              <SummaryRow label="Rentang acara">
                {formatTime(ownedEvent.date)}
                {ownedEvent.endDate ? ` – ${formatTime(ownedEvent.endDate)}` : ""}
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
                  href={`/organizer/events/${ownedEvent.id}/attendees`}
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
                href: `/organizer/events/${ownedEvent.id}/tickets`,
                label: "Kelola kategori tiket",
                icon: <Ticket className="h-3.5 w-3.5" />,
              },
              {
                href: `/organizer/events/${ownedEvent.id}/attendees`,
                label: "Lihat data peserta",
                icon: <Users className="h-3.5 w-3.5" />,
              },
              {
                href: `/organizer/events/${ownedEvent.id}/edit`,
                label: "Edit informasi event",
                icon: <Pencil className="h-3.5 w-3.5" />,
              },
            ]}
          />

          <Card className="p-5">
            <CardHeader title="Ringkasan penjualan" />
            <div className="mt-3 space-y-2">
              <SummaryRow label="Harga mulai">
                <Price value={ownedEvent.minPrice} short />
              </SummaryRow>
              <SummaryRow label="Terjual">
                {percent(ownedEvent.totalSold, ownedEvent.totalQuota)}%
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
