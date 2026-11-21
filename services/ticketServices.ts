import { api, unwrap } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Order } from "@/types/order";
import type { Ticket } from "@/types/ticket";

/* ------------------ Ticket milik customer (belum ada endpoint) ----------------- */

/**
 * Turunan tiket dari order yang sudah lunas. Tidak memakai data dummy;
 * informasi check-in tidak tersedia sampai backend menyediakan endpoint.
 */
export function ticketsForOrder(order: Order): Ticket[] {
  if (order.status !== "paid") return [];

  let counter = 0;
  return order.items.flatMap((item) =>
    Array.from({ length: item.qty }, () => {
      counter += 1;
      return {
        id: `TKT-${order.id}-${counter}`,
        orderId: order.id,
        eventId: order.eventId,
        eventTitle: order.eventTitle,
        eventDate: order.eventDate,
        venue: order.venue,
        city: "",
        ticketTypeName: item.ticketTypeName,
        holderName: order.customerName,
        status: "active" as const,
        qrToken: `TKTKU-${order.id}-${counter}-${order.eventId.toUpperCase()}`,
      } satisfies Ticket;
    }),
  );
}

export async function getTicketsByCustomer(_customerId: string): Promise<Ticket[]> {
  return [];
}

export async function getTicketById(_id: string): Promise<Ticket | undefined> {
  return undefined;
}

export async function getTicketsForOrder(_orderId: string): Promise<Ticket[]> {
  return [];
}

/* --------------------- Endpoint backend: Ticket (publik) ------------------ */

/** Gabungan field_public (`/events/:id/tickets`) dan field organizer. */
export type TicketTypeRecord = {
  id: string;
  event_id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  total_quota?: number;
  sold?: number;
  reserved?: number;
  available?: number;
  sale_start: string;
  sale_end: string;
  sale_status?: string;
  max_per_order?: number;
  sort_order?: number;
  is_active?: boolean;
};

export type CreateTicketPayload = {
  name: string;
  description?: string;
  price: number;
  total_quota: number;
  sale_start: string;
  sale_end: string;
  max_per_order?: number;
  sort_order?: number;
};

export type UpdateTicketPayload = Partial<CreateTicketPayload> & {
  is_active?: boolean;
};

/** GET /api/v1/events/:id/tickets (publik, tanpa kuota/sold/reserved) */
export async function listPublicTickets(eventId: string): Promise<TicketTypeRecord[]> {
  return unwrap(
    await api.get<ApiResponse<TicketTypeRecord[]>>(
      `/events/${encodeURIComponent(eventId)}/tickets`,
    ),
  );
}

/* ------------------- Endpoint backend: Ticket (organizer) ----------------- */

/** POST /api/v1/organizer/events/:event_id/tickets */
export async function createTicket(
  eventId: string,
  payload: CreateTicketPayload,
): Promise<TicketTypeRecord> {
  return unwrap(
    await api.post<ApiResponse<TicketTypeRecord>>(
      `/organizer/events/${encodeURIComponent(eventId)}/tickets`,
      payload,
    ),
  );
}

/** GET /api/v1/organizer/events/:event_id/tickets */
export async function listOrganizerTickets(
  eventId: string,
): Promise<TicketTypeRecord[]> {
  return unwrap(
    await api.get<ApiResponse<TicketTypeRecord[]>>(
      `/organizer/events/${encodeURIComponent(eventId)}/tickets`,
    ),
  );
}

/** GET /api/v1/organizer/events/:event_id/tickets/:id */
export async function getOrganizerTicket(
  eventId: string,
  ticketId: string,
): Promise<TicketTypeRecord> {
  return unwrap(
    await api.get<ApiResponse<TicketTypeRecord>>(
      `/organizer/events/${encodeURIComponent(eventId)}/tickets/${encodeURIComponent(ticketId)}`,
    ),
  );
}

/** PUT /api/v1/organizer/events/:event_id/tickets/:id */
export async function updateTicket(
  eventId: string,
  ticketId: string,
  payload: UpdateTicketPayload,
): Promise<TicketTypeRecord> {
  return unwrap(
    await api.put<ApiResponse<TicketTypeRecord>>(
      `/organizer/events/${encodeURIComponent(eventId)}/tickets/${encodeURIComponent(ticketId)}`,
      payload,
    ),
  );
}

/** DELETE /api/v1/organizer/events/:event_id/tickets/:id */
export async function deleteTicket(eventId: string, ticketId: string): Promise<void> {
  await api.delete(
    `/organizer/events/${encodeURIComponent(eventId)}/tickets/${encodeURIComponent(ticketId)}`,
  );
}

/** GET /api/v1/admin/events/:event_id/tickets */
export async function listAdminTickets(
  eventId: string,
): Promise<TicketTypeRecord[]> {
  return unwrap(
    await api.get<ApiResponse<TicketTypeRecord[]>>(
      `/admin/events/${encodeURIComponent(eventId)}/tickets`,
    ),
  );
}
