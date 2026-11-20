import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Pencil, Ticket, TrendingUp } from "lucide-react";
import { TicketTypeForm } from "@/components/organizer/ticket-type-form";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { requireRole } from "@/lib/guards";
import { formatDate, percent } from "@/lib/utils";
import { getEventById } from "@/services/event.service";

export const metadata: Metadata = {
  title: "Kelola Tiket",
};

export default async function EventTicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; ticketTypeId?: string }>;
}) {
  await requireRole("organizer", "/organizer/events");
  const { id } = await params;
  const { saved, error, ticketTypeId } = await searchParams;

  const event = await getEventById(id, { includeUnpublished: true });
  if (!event) notFound();

  const editing = ticketTypeId
    ? event.ticketTypes.find((ticket) => ticket.id === ticketTypeId)
    : undefined;

  const totalQuota = event.ticketTypes.reduce((total, ticket) => total + ticket.quota, 0);
  const totalSold = event.ticketTypes.reduce((total, ticket) => total + ticket.sold, 0);
  const potential = event.ticketTypes.reduce(
    (total, ticket) => total + ticket.price * ticket.quota,
    0,
  );
  const revenue = event.ticketTypes.reduce(
    (total, ticket) => total + ticket.price * ticket.sold,
    0,
  );

  return (
    <main>
      <BackLink href={`/organizer/events/${event.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Kategori tiket"
        title={`Tiket · ${event.title}`}
        subtitle="Atur harga, kuota, periode penjualan, dan benefit tiap kategori."
        className="mt-4"
      />

      {saved && (
        <Alert tone="success" className="mb-5">
          Kategori tiket berhasil disimpan.
        </Alert>
      )}
      {error === "required" && (
        <Alert tone="danger" className="mb-5">
          Nama kategori, harga, dan kuota wajib diisi dengan benar.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile label="Kategori" value={event.ticketTypes.length} hint="Jenis tiket aktif" />
        <StatTile
          label="Tiket terjual"
          value={totalSold.toLocaleString("id-ID")}
          hint={`dari ${totalQuota.toLocaleString("id-ID")} kuota`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Pendapatan tiket"
          value={<Price value={revenue} short />}
          hint="Estimasi dari tiket terjual"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Potensi maksimal"
          value={<Price value={potential} short />}
          hint="Jika seluruh kuota terjual"
          tone="gold"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          {event.ticketTypes.length === 0 && (
            <EmptyState
              title="Belum ada kategori tiket"
              description="Gunakan form di samping untuk menambahkan kategori pertama."
            />
          )}

          {event.ticketTypes.map((ticket) => (
            <Card key={ticket.id} className="p-5">
              <CardHeader
                title={ticket.name}
                action={
                  <Badge tone="slate">
                    {percent(ticket.sold, ticket.quota)}% terjual
                  </Badge>
                }
              />
              <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-lg text-sm text-muted">{ticket.description}</p>
                <div className="text-right">
                  <Price value={ticket.price} />
                  <div className="text-xs text-muted">Maks. {ticket.maxPerOrder} / order</div>
                </div>
              </div>

              <div className="mt-3">
                <Progress value={ticket.sold} total={ticket.quota} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(ticket.salesStart, { dateStyle: "medium" })} –{" "}
                    {formatDate(ticket.salesEnd, { dateStyle: "medium" })}
                  </span>
                  <span>Kuota {ticket.quota.toLocaleString("id-ID")}</span>
                </div>
                <ButtonLink
                  href={`/organizer/events/${event.id}/tickets?ticketTypeId=${ticket.id}`}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </ButtonLink>
              </div>

              {ticket.benefits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ticket.benefits.map((benefit) => (
                    <Badge key={benefit} tone="slate" className="font-medium">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </section>

        <aside className="h-fit space-y-4">
          <TicketTypeForm eventId={event.id} ticket={editing} />
          {editing && (
            <ButtonLink
              href={`/organizer/events/${event.id}/tickets`}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Batal edit, tambah kategori baru
            </ButtonLink>
          )}
          <Card className="p-5">
            <CardHeader title="Catatan" />
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li>Kuota tidak boleh lebih kecil dari tiket yang sudah terjual.</li>
              <li>Harga dan kuota baru berlaku untuk pembelian berikutnya.</li>
              <li>Perubahan langsung terlihat di halaman event publik.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
