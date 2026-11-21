export type EventCategory = "music" | "conference" | "comedy" | "workshop" | "festival" | "sport";

export type EventStatus = "draft" | "pending" | "published" | "rejected" | "ended";

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
  description: string;
  benefits: string[];
}

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  city: string;
  venue: string;
  address: string;
  date: string;
  endDate?: string;
  description: string;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  featured?: boolean;
  /** Local path under /public. Falls back to a category gradient when absent. */
  imageUrl?: string;
  /** Short promo line shown on covers and the featured banner. */
  promoLabel?: string;
  rating: number;
  ticketTypes: TicketType[];
}

export interface EventQuery {
  q?: string;
  category?: string;
  city?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "soonest" | "cheapest" | "popular";
  page?: number;
  perPage?: number;
}

export interface EventWithStats extends Event {
  minPrice: number;
  totalQuota: number;
  totalSold: number;
}
