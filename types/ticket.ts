export type TicketStatus = "active" | "used" | "cancelled";

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  city: string;
  ticketTypeName: string;
  holderName: string;
  status: TicketStatus;
  qrToken: string;
  checkedInAt?: string;
}
