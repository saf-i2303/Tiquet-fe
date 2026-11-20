import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/organizer/event-form";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/guards";
import { getEventById } from "@/services/event.service";

export const metadata: Metadata = {
  title: "Edit Event",
};

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("organizer", "/organizer/events");
  const { id } = await params;
  const { error } = await searchParams;

  const event = await getEventById(id, { includeUnpublished: true });
  if (!event) notFound();

  return (
    <main>
      <BackLink href={`/organizer/events/${event.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Edit event"
        title={event.title}
        subtitle="Perubahan pada event yang sudah tayang akan tetap tersimpan dan langsung terlihat pembeli."
        className="mt-4"
      />

      {error === "required" && (
        <Alert tone="danger" className="mb-5">
          Nama event, venue, dan tanggal wajib diisi.
        </Alert>
      )}

      <EventForm event={event} />
    </main>
  );
}
