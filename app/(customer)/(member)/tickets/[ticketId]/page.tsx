import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ETicket } from "@/components/ticket/ticket-card";
import { TicketActions } from "@/components/ticket/ticket-actions";
import { BackLink } from "@/components/ui/back-link";
import { getOrderById } from "@/services/order.service";
import { getTicketById } from "@/services/ticket.service";

export const metadata: Metadata = {
  title: "E-Ticket",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = await getTicketById(ticketId);
  if (!ticket) notFound();

  const order = await getOrderById(ticket.orderId);
  if (!order) notFound();

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
