import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ticket as TicketIcon } from "lucide-react";
import { TicketSelector } from "@/components/event/ticket-selector";
import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EventMeta } from "@/components/shared/event-meta";
import { PageHeader } from "@/components/ui/page-header";
import { getSession } from "@/lib/auth";
import { SERVICE_FEE } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import { getEventById } from "@/services/event.service";

export const metadata: Metadata = {
  title: "Pilih Tiket",
};

export default async function SelectTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [event, session] = await Promise.all([getEventById(id), getSession()]);
  if (!event) notFound();

  const available = event.ticketTypes.filter((ticket) => ticket.quota - ticket.sold > 0);

  return (
    <main className="page-container py-8">
      <BackLink href={`/events/${event.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Pilih tiket"
        title={event.title}
        subtitle="Tentukan kategori dan jumlah tiket. Kuota dibatasi agar semua kebagian."
      />

      <Card className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 p-4 text-sm">
        <EventMeta date={event.date} time={event.date} venue={event.venue} city={event.city} />
        <span className="ml-auto text-xs text-muted">
          Biaya layanan {formatRupiah(SERVICE_FEE)} per transaksi
        </span>
      </Card>

      {available.length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="h-5 w-5" />}
          title="Semua tiket sudah habis"
          description="Semua tiket untuk event ini sudah habis. Pantau terus halaman event untuk info tambahan."
        />
      ) : (
        <TicketSelector
          eventId={event.id}
          ticketTypes={available}
          defaultPhone={session?.phone}
          error={error}
        />
      )}
    </main>
  );
}
