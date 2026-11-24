"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { requireOwnedEvent } from "@/lib/ownership";
import { EventForm } from "@/components/organizer/event-form";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { PageHeader } from "@/components/ui/page-header";
import { getEventById } from "@/services/eventServices";
import type { EventWithStats } from "@/types/event";

export default function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = use(params);
  const { error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

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

  function refetch() {
    getEventById(id, { includeUnpublished: true })
      .then((data) => {
        if (data) setEvent(data);
      })
      .catch(() => undefined);
    router.refresh();
  }

  return (
    <main>
      <BackLink href={`/organizer/events/${ownedEvent.id}`} label="Kembali ke detail event" />

      <PageHeader
        kicker="Edit event"
        title={ownedEvent.title}
        subtitle="Perubahan pada event yang sudah tayang akan tetap tersimpan dan langsung terlihat pembeli."
        className="mt-4"
      />

      {error === "required" && (
        <Alert tone="danger" className="mb-5">
          Nama event, venue, dan tanggal wajib diisi.
        </Alert>
      )}

      <EventForm event={ownedEvent} onSaved={refetch} />
    </main>
  );
}
