"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Pencil, Ticket, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { requireOwnedEvent } from "@/lib/ownership";
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
import { formatDate, percent } from "@/lib/utils";
import { getEventById } from "@/services/eventServices";
import type { EventWithStats } from "@/types/event";

export default function EventTicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; ticketTypeId?: string }>;
}) {
  const { id } = use(params);
  const { saved, error, ticketTypeId } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;

    getEventById(id, { includeUnpublished: true })
      .then((data) => {
        if (active) setEvent(data ?? null);
      })
      .catch(() => {
        if (active) setEvent(null);
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

  function handleSaved() {
    setSavedLocally(true);
    getEventById(id, { includeUnpublished: true })
      .then((data) => {
        if (data) setEvent(data);
      })
      .catch(() => undefined);
    router.refresh();
  }

  const editing = ticketTypeId
    ? ownedEvent.ticketTypes.find((ticket) => ticket.id === ticketTypeId)
    : undefined;

  const totalQuota = ownedEvent.ticketTypes.reduce((total, ticket) => total + ticket.quota, 0);
  const totalSold = ownedEvent.ticketTypes.reduce((total, ticket) => total + ticket.sold, 0);
  const potential = ownedEvent.ticketTypes.reduce(
    (total, ticket) => total + ticket.price * ticket.quota,
    0,
  );
  const revenue = ownedEvent.ticketTypes.reduce(
    (total, ticket) => total + ticket.price * ticket.sold,
    0,
  );

  return (
    <main>
      <BackLink href={`/organizer/events/${ownedEvent.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Kategori tiket"
        title={`Tiket · ${ownedEvent.title}`}
        subtitle="Atur harga, kuota, periode penjualan, dan benefit tiap kategori."
        className="mt-4"
      />

      {(saved || savedLocally) && (
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
        <StatTile label="Kategori" value={ownedEvent.ticketTypes.length} hint="Jenis tiket aktif" />
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
          {ownedEvent.ticketTypes.length === 0 && (
            <EmptyState
              title="Belum ada kategori tiket"
              description="Gunakan form di samping untuk menambahkan kategori pertama."
            />
          )}

          {ownedEvent.ticketTypes.map((ticket) => (
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
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink
                    href={`/organizer/events/${ownedEvent.id}/tickets/${ticket.id}`}
                    variant="ghost"
                    size="sm"
                  >
                    Detail
                  </ButtonLink>
                  <ButtonLink
                    href={`/organizer/events/${ownedEvent.id}/tickets?ticketTypeId=${ticket.id}`}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </ButtonLink>
                </div>
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
          <TicketTypeForm eventId={ownedEvent.id} ticket={editing} onSaved={handleSaved} />
          {editing && (
            <ButtonLink
              href={`/organizer/events/${ownedEvent.id}/tickets`}
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
