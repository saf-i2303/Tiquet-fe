import { USE_MOCK, apiFetch } from "@/lib/api";
import { checkIns } from "@/lib/mocks/checkins";
import { events } from "@/lib/mocks/events";
import { orders } from "@/lib/mocks/orders";
import type { Order } from "@/types/order";
import type { Ticket } from "@/types/ticket";

const checkedIn = new Map(
  checkIns
    .filter((checkIn) => checkIn.result === "valid")
    .map((checkIn) => [checkIn.ticketId, checkIn.at]),
);

export function ticketsForOrder(order: Order): Ticket[] {
  if (order.status !== "paid") return [];

  const event = events.find((item) => item.id === order.eventId);
  let counter = 0;

  return order.items.flatMap((item) =>
    Array.from({ length: item.qty }, () => {
      counter += 1;
      const ticketId = `TKT-${order.id.replace("ORD-", "")}-${counter}`;
      const checkedAt = checkedIn.get(ticketId);

      return {
        id: ticketId,
        orderId: order.id,
        eventId: order.eventId,
        eventTitle: order.eventTitle,
        eventDate: order.eventDate,
        venue: order.venue,
        city: event?.city ?? "Jakarta",
        ticketTypeName: item.ticketTypeName,
        holderName: order.customerName,
        status: checkedAt ? "used" : "active",
        qrToken: `TKTKU-${order.id}-${counter}-${order.eventId.toUpperCase()}`,
        checkedInAt: checkedAt,
      } satisfies Ticket;
    }),
  );
}

export async function getTicketsByCustomer(customerId: string): Promise<Ticket[]> {
  if (!USE_MOCK) {
    return apiFetch<Ticket[]>(`/tickets?customerId=${customerId}`);
  }

  return orders
    .filter((order) => order.customerId === customerId)
    .flatMap(ticketsForOrder)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const all = orders.flatMap(ticketsForOrder);
  return all.find((ticket) => ticket.id === id);
}

export async function getTicketsForOrder(orderId: string): Promise<Ticket[]> {
  const order = orders.find((item) => item.id === orderId);
  return order ? ticketsForOrder(order) : [];
}
