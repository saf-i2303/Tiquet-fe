"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { requireOwnedOrder } from "@/lib/ownership";
import { ETicket } from "@/components/ticket/ticket-card";
import { TicketActions } from "@/components/ticket/ticket-actions";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserFromStorage } from "@/lib/api";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { getOrderById } from "@/services/order.service";
import { getTicketById } from "@/services/ticketServices";
import type { Order } from "@/types/order";
import type { Ticket } from "@/types/ticket";

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );

  const [ticket, setTicket] = useState<Ticket | undefined>(undefined);
  const [foundOrder, setFoundOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let active = true;

    void (async () => {
      try {
        const ticketData = await getTicketById(ticketId);
        if (!active) return;
        setTicket(ticketData);

        const orderData = ticketData ? await getOrderById(ticketData.orderId) : undefined;
        if (!active) return;
        setFoundOrder(orderData);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [ticketId, session]);

  if (isLoading || !session) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
        <Alert tone="info">Memuat data...</Alert>
      </main>
    );
  }

  if (!ticket) notFound();

  requireOwnedOrder(foundOrder, session);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
      <BackLink href="/tickets" label="Kembali ke tiket saya" />

      <ETicket ticket={ticket} />

      <div className="mt-4">
        <TicketActions ticket={ticket} />
      </div>
    </main>
  );
}
