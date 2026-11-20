import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Ticket, TrendingUp, Users, X } from "lucide-react";
import { CategoryIcon } from "@/components/event/category-icon";
import { EventMeta } from "@/components/shared/event-meta";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { moderateEventAction } from "@/lib/actions/admin.action";
import { categoryMeta, eventStatusMeta, orderStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatRupiah } from "@/lib/utils";
import { getAllEvents, getAllOrders } from "@/services/admin.service";

export const metadata: Metadata = {
  title: "Review Event",
};

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("super_admin", "/admin/events");
  const { id } = await params;

  const [events, orders] = await Promise.all([getAllEvents(), getAllOrders()]);
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  const eventOrders = orders.filter((order) => order.eventId === event.id);
  const paidOrders = eventOrders.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((total, order) => total + order.total, 0);
  const meta = categoryMeta[event.category];

  return (
    <main>
      <DetailHeader
        backHref="/admin/events"
        backLabel="Kembali ke moderasi event"
        title={event.title}
        badge={
          <>
            <Badge tone="gold">{meta.label}</Badge>
            <StatusBadge value={event.status} map={eventStatusMeta} />
          </>
        }
        subtitle={
          <div className="space-y-1">
            <EventMeta
              date={event.date}
              endDate={event.endDate}
              time={event.date}
              venue={event.venue}
              city={event.city}
            />
            <span>
              Diajukan oleh{" "}
              <Link
                href={`/admin/organizers/${event.organizerId}`}
                className="font-semibold text-navy-900 hover:underline"
              >
                {event.organizerName}
              </Link>
            </span>
          </div>
        }
        actions={
          <>
            {event.status !== "published" && (
              <form action={moderateEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="decision" value="published" />
                <Button size="sm">
                  <Check className="h-3.5 w-3.5" /> Setujui &amp; tayangkan
                </Button>
              </form>
            )}
            {event.status !== "rejected" && (
              <form action={moderateEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="decision" value="rejected" />
                <Button variant="danger" size="sm">
                  <X className="h-3.5 w-3.5" /> Tolak event
                </Button>
              </form>
            )}
          </>
        }
      />

      <div className="stat-grid mb-6">
        <StatTile
          label="Tiket terjual"
          value={event.totalSold.toLocaleString("id-ID")}
          hint={`dari ${event.totalQuota.toLocaleString("id-ID")} kuota`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Pendapatan"
          value={formatRupiah(revenue)}
          hint="Dari order lunas"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Transaksi"
          value={eventOrders.length}
          hint={`${paidOrders.length} lunas`}
          icon={<Users className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Kategori tiket"
          value={event.ticketTypes.length}
          hint="Jenis tiket"
          tone="blue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-stack">
          <Card className="p-5">
            <CardHeader title="Deskripsi event" />
            <p className="body-copy mt-2 text-navy-800">
              {event.description || "Organizer belum mengisi deskripsi."}
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Alamat lengkap</dt>
                <dd className="font-semibold text-navy-900">{event.address}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Kategori</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-navy-900">
                  <CategoryIcon category={event.category} className="h-4 w-4 text-gold-600" />
                  {meta.label}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <CardHeader title="Kategori tiket" />
            {event.ticketTypes.length === 0 ? (
              <EmptyState title="Belum ada kategori tiket." className="mt-4" />
            ) : (
              <div className="mt-4 space-y-3">
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="rounded-control border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-navy-900">{ticket.name}</div>
                        <p className="mt-0.5 text-sm text-muted">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <Price value={ticket.price} className="text-base" />
                        <div className="text-xs text-muted">
                          Maks. {ticket.maxPerOrder} / transaksi
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={ticket.sold} total={ticket.quota} label={ticket.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader title="Pedoman moderasi" />
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li>Judul dan deskripsi tidak menyesatkan.</li>
              <li>Venue dan jadwal jelas serta realistis.</li>
              <li>Harga tiket wajar dan kuota tersedia.</li>
              <li>Organizer berstatus terverifikasi.</li>
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Order terbaru" className="p-4" />
            {eventOrders.length === 0 ? (
              <EmptyState title="Belum ada order untuk event ini." className="m-4" />
            ) : (
              <div className="divide-y divide-line border-t border-line">
                {eventOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-2 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-navy-900">{order.id}</div>
                      <div className="text-xs text-muted">{order.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-navy-900">
                        <Price value={order.total} />
                      </div>
                      <StatusBadge value={order.status} map={orderStatusMeta} />
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
