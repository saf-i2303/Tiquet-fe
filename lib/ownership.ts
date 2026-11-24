import { notFound } from "next/navigation";
import type { Event } from "@/types/event";
import type { Order } from "@/types/order";
import type { SessionUser } from "@/types/user";

/** Objek yang bukan milik sesi diberi 404 agar keberadaannya tidak bocor. */
export function requireOwnedOrder<T extends Order>(
  order: T | null | undefined,
  session: SessionUser,
): T {
  if (!order) notFound();

  const sameId = order.customerId === session.id;
  const sameEmail = session.email
    ? order.customerEmail.toLowerCase() === session.email.toLowerCase()
    : false;
  if (!sameId && !sameEmail) notFound();

  return order;
}

export function requireOrganizerId(session: SessionUser): string {
  if (!session.organizerId) notFound();
  return session.organizerId;
}

export function requireOwnedEvent<T extends Event>(
  event: T | null | undefined,
  session: SessionUser,
): T {
  if (!event) notFound();
  if (event.organizerId !== requireOrganizerId(session)) notFound();
  return event;
}
