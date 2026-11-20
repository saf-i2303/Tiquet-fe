import { auditLogs } from "@/lib/mocks/settings";
import { events } from "@/lib/mocks/events";
import { orders } from "@/lib/mocks/orders";
import { organizers, payouts } from "@/lib/mocks/organizers";
import { users } from "@/lib/mocks/users";
import { toEventWithStats } from "@/services/event.service";
import type { EventWithStats } from "@/types/event";
import type { Organizer, OrganizerPayout } from "@/types/organizer";
import type { User } from "@/types/user";

export interface PayoutWithOrganizer extends OrganizerPayout {
  organizerName: string;
}

export async function getPlatformStats() {
  const paidOrders = orders.filter((order) => order.status === "paid");

  return {
    totalUsers: users.length,
    totalOrganizers: organizers.length,
    pendingOrganizers: organizers.filter((organizer) => organizer.status === "pending").length,
    publishedEvents: events.filter((event) => event.status === "published").length,
    pendingEvents: events.filter((event) => event.status === "pending").length,
    grossRevenue: paidOrders.reduce((total, order) => total + order.total, 0),
    ticketsSold: paidOrders.reduce(
      (total, order) => total + order.items.reduce((sum, item) => sum + item.qty, 0),
      0,
    ),
    transactions: orders.length,
  };
}

export async function getUsers(): Promise<User[]> {
  return users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  return users.find((user) => user.id === id);
}

export async function getOrganizersList(): Promise<Organizer[]> {
  return organizers;
}

export async function getPendingOrganizers(): Promise<Organizer[]> {
  return organizers.filter((organizer) => organizer.status === "pending");
}

export async function getOrganizerById(id: string): Promise<Organizer | undefined> {
  return organizers.find((organizer) => organizer.id === id);
}

export async function getAllEvents(): Promise<EventWithStats[]> {
  return events.map(toEventWithStats).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getAllOrders() {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}



export async function getPayoutsList(): Promise<PayoutWithOrganizer[]> {
  return [...payouts]
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    .map((payout) => ({
      ...payout,
      organizerName:
        organizers.find((organizer) => organizer.id === payout.organizerId)?.name ??
        payout.organizerId,
    }));
}

export async function getAuditLogs() {
  return [...auditLogs].sort((a, b) => b.at.localeCompare(a.at));
}
