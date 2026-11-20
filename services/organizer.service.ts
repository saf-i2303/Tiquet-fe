import { attendees } from "@/lib/mocks/attendees";
import { events } from "@/lib/mocks/events";
import { orders } from "@/lib/mocks/orders";
import { organizers, payouts } from "@/lib/mocks/organizers";
import { toEventWithStats } from "@/services/event.service";
import type { EventWithStats } from "@/types/event";
import type {
  Attendee,
  Organizer,
  OrganizerMember,
  OrganizerPayout,
} from "@/types/organizer";
import type { Order } from "@/types/order";

export async function getOrganizer(id: string): Promise<Organizer | undefined> {
  return organizers.find((organizer) => organizer.id === id);
}

export async function getOrganizerEvents(organizerId: string): Promise<EventWithStats[]> {
  return events
    .filter((event) => event.organizerId === organizerId)
    .map(toEventWithStats)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getOrganizerTransactions(organizerId: string): Promise<Order[]> {
  const eventIds = new Set(
    events.filter((event) => event.organizerId === organizerId).map((event) => event.id),
  );
  return orders
    .filter((order) => eventIds.has(order.eventId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrganizerStats(organizerId: string) {
  const organizerEvents = events.filter((event) => event.organizerId === organizerId);
  const transactions = await getOrganizerTransactions(organizerId);
  const paid = transactions.filter((order) => order.status === "paid");
  const ticketsSold = paid.reduce(
    (total, order) => total + order.items.reduce((sum, item) => sum + item.qty, 0),
    0,
  );

  return {
    revenue: paid.reduce((total, order) => total + order.total, 0),
    ticketsSold,
    activeEvents: organizerEvents.filter((event) => event.status === "published").length,
    totalEvents: organizerEvents.length,
    transactions: transactions.length,
    avgOrderValue: paid.length
      ? Math.round(paid.reduce((total, order) => total + order.total, 0) / paid.length)
      : 0,
    attendees,
  };
}

export async function getOrganizerMembers(organizerId: string): Promise<OrganizerMember[]> {
  const organizer = await getOrganizer(organizerId);
  return organizer?.members ?? [];
}

export async function getOrganizerPayouts(organizerId: string): Promise<OrganizerPayout[]> {
  return payouts.filter((payout) => payout.organizerId === organizerId);
}

export async function getEventAttendees(eventId: string): Promise<Attendee[]> {
  const paidOrders = orders.filter(
    (order) => order.eventId === eventId && order.status === "paid",
  );

  const matched = attendees.filter((attendee) =>
    paidOrders.some((order) => order.id === attendee.orderId),
  );

  const knownOrderIds = new Set(matched.map((attendee) => attendee.orderId));
  const derived = paidOrders
    .filter((order) => !knownOrderIds.has(order.id))
    .flatMap((order) =>
      order.items.flatMap((item) =>
        Array.from({ length: item.qty }, (_, index) => ({
          id: `att-${order.id}-${item.ticketTypeId}-${index + 1}`,
          name: order.customerName,
          email: order.customerEmail,
          ticketType: item.ticketTypeName,
          orderId: order.id,
          status: "not_checked_in" as const,
        })),
      ),
    );

  return [...matched, ...derived];
}

export async function getOrganizerRevenueByEvent(organizerId: string) {
  const organizerEvents = events.filter((event) => event.organizerId === organizerId);
  return organizerEvents
    .map((event) => {
      const paid = orders.filter(
        (order) => order.eventId === event.id && order.status === "paid",
      );
      return {
        eventId: event.id,
        title: event.title,
        revenue: paid.reduce((total, order) => total + order.total, 0),
        tickets: paid.reduce(
          (total, order) => total + order.items.reduce((sum, item) => sum + item.qty, 0),
          0,
        ),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}
