import { ApiError, api, unwrap } from "@/lib/api";
import { EVENTS_PER_PAGE, categoryMeta } from "@/lib/constants";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Event, EventCategory, EventQuery, EventWithStats, TicketType } from "@/types/event";
import { createTicket, listOrganizerTickets, listPublicTickets, updateTicket } from "@/services/ticketServices";
import type { TicketTypeRecord } from "@/services/ticketServices";
import { createVenue, listVenues } from "@/services/venueServices";

/* ------------------------- Backend wire shapes ------------------------- */

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ApiVenue {
  id?: string;
  name: string;
  address: string;
  city: string;
  capacity?: number;
}

/** PublicEventDetail / EventDetailResponse; field organizer opsional. */
export interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  status: string;
  organizer_id?: string;
  organizer_name?: string;
  category?: ApiCategory;
  category_id?: number;
  venue?: ApiVenue;
  venue_id?: string;
  published_at?: string;
  created_at?: string;
}

/** `event.Event` dari endpoint organizer: hanya ID kategori/venue. */
export interface ApiOrganizerEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  status: string;
  organizer_id?: string;
  category_id?: number;
  venue_id?: string;
  created_at?: string;
}

export type ApiEventList = Paginated<ApiEvent>;
export type ApiOrganizerEventList = Paginated<ApiOrganizerEvent>;

const categorySlugByValue: Record<EventCategory, string> = {
  music: "konser",
  conference: "seminar",
  comedy: "teater",
  workshop: "workshop",
  festival: "festival",
  sport: "olahraga",
};

const categoryValueBySlug: Record<string, EventCategory> = {
  konser: "music",
  festival: "festival",
  seminar: "conference",
  workshop: "workshop",
  olahraga: "sport",
  teater: "comedy",
  pameran: "conference",
  lainnya: "music",
};

const categoryIdByValue: Record<EventCategory, number> = {
  music: 1,
  festival: 2,
  conference: 3,
  workshop: 4,
  sport: 5,
  comedy: 7,
};

function toUiStatus(status: string): Event["status"] {
  if (status === "pending_review") return "pending";
  if (status === "cancelled") return "ended";
  if (status === "draft" || status === "published" || status === "rejected") return status;
  return "draft";
}

function toTicketType(record: TicketTypeRecord, eventId: string): TicketType {
  return {
    id: record.id,
    eventId: record.event_id ?? eventId,
    name: record.name,
    price: record.price ?? 0,
    quota: record.total_quota ?? record.available ?? 0,
    sold: record.sold ?? 0,
    maxPerOrder: record.max_per_order ?? 0,
    salesStart: record.sale_start,
    salesEnd: record.sale_end,
    description: record.description ?? "",
    benefits: [],
  };
}

function withTicketStats(
  event: Omit<Event, "ticketTypes"> & { ticketTypes?: TicketType[] },
  tickets: TicketTypeRecord[],
  eventId: string,
): EventWithStats {
  const ticketTypes = tickets.map((ticket) => toTicketType(ticket, eventId));
  const totalQuota = ticketTypes.reduce((sum, ticket) => sum + ticket.quota, 0);
  const totalSold = ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
  const minPrice = ticketTypes.length
    ? Math.min(...ticketTypes.map((ticket) => ticket.price))
    : 0;

  return {
    ...event,
    ticketTypes,
    minPrice,
    totalQuota,
    totalSold,
  };
}

/** Map wire event publik/admin ke model UI. */
export function toEvent(item: ApiEvent, tickets: TicketTypeRecord[] = []): EventWithStats {
  const base: Omit<Event, "ticketTypes"> = {
    id: item.id,
    title: item.title,
    category: categoryValueBySlug[item.category?.slug ?? ""] ?? "music",
    city: item.venue?.city ?? "",
    venue: item.venue?.name ?? "",
    address: item.venue?.address ?? "",
    date: item.start_at,
    endDate: item.end_at,
    description: item.description ?? "",
    organizerId: item.organizer_id ?? "",
    organizerName: item.organizer_name ?? "",
    status: toUiStatus(item.status),
    featured: false,
    rating: 0,
  };
  return withTicketStats(base, tickets, item.id);
}

/** Map `event.Event` (organizer) ke model UI dengan lookup kategori/venue. */
export function toOrganizerEvent(
  item: ApiOrganizerEvent,
  categories: ApiCategory[],
  venues: { id: string; name: string; address: string; city: string }[],
  tickets: TicketTypeRecord[] = [],
): EventWithStats {
  const category = categories.find((entry) => entry.id === item.category_id);
  const venue = venues.find((entry) => entry.id === item.venue_id);
  return withTicketStats(
    {
      id: item.id,
      title: item.title,
      category: categoryValueBySlug[category?.slug ?? ""] ?? "music",
      city: venue?.city ?? "",
      venue: venue?.name ?? "",
      address: venue?.address ?? "",
      date: item.start_at,
      endDate: item.end_at,
      description: item.description ?? "",
      organizerId: item.organizer_id ?? "",
      organizerName: "",
      status: toUiStatus(item.status),
      featured: false,
      rating: 0,
    },
    tickets,
    item.id,
  );
}

export function toEventWithStats(event: Event): EventWithStats {
  const totalQuota = event.ticketTypes.reduce((sum, ticket) => sum + ticket.quota, 0);
  const totalSold = event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
  const minPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((ticket) => ticket.price))
    : 0;
  return { ...event, minPrice, totalQuota, totalSold };
}

async function withPublicTickets(items: ApiEvent[]): Promise<EventWithStats[]> {
  return Promise.all(
    items.map(async (item) => {
      const tickets = await listPublicTickets(item.id).catch(() => [] as TicketTypeRecord[]);
      return toEvent(item, tickets);
    }),
  );
}

/* ---------------------------- UI-facing reads --------------------------- */

export async function getEvents(query: EventQuery = {}): Promise<Paginated<EventWithStats>> {
  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    limit: query.perPage ?? EVENTS_PER_PAGE,
  };
  if (query.q) params.q = query.q;
  if (query.city) params.city = query.city;
  if (query.category) {
    params.category = categorySlugByValue[query.category as EventCategory] ?? query.category;
  }
  if (query.date) params.from = query.date;

  const { items, pagination } = unwrap(
    await api.get<ApiResponse<ApiEventList>>("/events", params, {
      next: { revalidate: 900, tags: ["events"] },
    }),
  );

  let result = await withPublicTickets(items);

  if (query.minPrice !== undefined) {
    result = result.filter((event) => event.minPrice >= (query.minPrice ?? 0));
  }
  if (query.maxPrice !== undefined) {
    result = result.filter((event) => event.minPrice <= (query.maxPrice ?? Infinity));
  }
  if (query.sort === "cheapest") result.sort((a, b) => a.minPrice - b.minPrice);
  else if (query.sort === "popular") result.sort((a, b) => b.totalSold - a.totalSold);
  else result.sort((a, b) => a.date.localeCompare(b.date));

  return { items: result, pagination };
}

export async function getFeaturedEvents(limit = 3): Promise<EventWithStats[]> {
  const { items } = await getEvents({ perPage: limit, sort: "soonest" });
  return items.slice(0, limit);
}

export async function getEventById(
  id: string,
  options: { includeUnpublished?: boolean } = {},
): Promise<EventWithStats | undefined> {
  try {
    if (options.includeUnpublished) {
      const [item, tickets] = await Promise.all([
        getOrganizerEvent(id),
        listOrganizerTickets(id).catch(() => [] as TicketTypeRecord[]),
      ]);
      const [categories, venues] = await Promise.all([
        listEventCategories().catch(() => [] as ApiCategory[]),
        listVenues().catch(() => []),
      ]);
      return toOrganizerEvent(item, categories, venues, tickets);
    }

    const item = await getPublicEvent(id);
    const tickets = await listPublicTickets(id).catch(() => [] as TicketTypeRecord[]);
    return toEvent(item, tickets);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function setEventStatus(
  id: string,
  status: Event["status"],
): Promise<Event | undefined> {
  if (status === "pending") await submitEvent(id);
  else if (status === "ended") {
    await cancelEvent(id, "Event dibatalkan oleh organizer.");
  }
  return getEventById(id, { includeUnpublished: true });
}

export interface CategoryEventGroup {
  category: EventCategory;
  label: string;
  events: EventWithStats[];
  total: number;
}

/** Published events grouped by category, independent of the active filter/page. */
export async function getEventsGroupedByCategory(limitPerCategory = 3): Promise<CategoryEventGroup[]> {
  const { items } = await getEvents({ perPage: 100, sort: "soonest" });

  return (Object.keys(categoryMeta) as EventCategory[])
    .map((category) => {
      const matching = items.filter((event) => event.category === category);
      return {
        category,
        label: categoryMeta[category].label,
        events: matching.slice(0, limitPerCategory),
        total: matching.length,
      };
    })
    .filter((group) => group.events.length > 0);
}

export async function getEventCategories(): Promise<
  { value: string; label: string; count: number }[]
> {
  const seen = new Set<string>();
  return (await listEventCategories())
    .map((category) => ({
      value: categoryValueBySlug[category.slug] ?? "music",
      label: category.name,
      count: 0,
    }))
    .filter((category) => {
      if (seen.has(category.value)) return false;
      seen.add(category.value);
      return true;
    });
}

export async function getEventCities(): Promise<string[]> {
  const { items } = await getEvents({ perPage: 100 });
  return [...new Set(items.map((event) => event.city).filter(Boolean))].sort();
}

/* ----------------------------- UI-facing writes ---------------------------- */

export interface SaveEventInput {
  id?: string;
  organizerId: string;
  organizerName: string;
  title: string;
  category: Event["category"];
  city: string;
  venue: string;
  address: string;
  date: string;
  endDate?: string;
  description: string;
  status?: Event["status"];
}

async function resolveCategoryId(category: EventCategory): Promise<number> {
  const categories = await listEventCategories().catch(() => [] as ApiCategory[]);
  const slug = categorySlugByValue[category];
  return categories.find((item) => item.slug === slug)?.id ?? categoryIdByValue[category];
}

async function resolveVenueId(input: SaveEventInput): Promise<string | undefined> {
  if (!input.venue) return undefined;
  const venues = await listVenues().catch(() => []);
  const existing = venues.find(
    (venue) => venue.name === input.venue && venue.city === input.city,
  );
  if (existing) return existing.id;

  const created = await createVenue({
    name: input.venue,
    address: input.address || input.venue,
    city: input.city || "Jakarta",
  });
  return created.id;
}

export async function saveEvent(input: SaveEventInput): Promise<Event> {
  const payload: CreateEventPayload = {
    title: input.title,
    category_id: await resolveCategoryId(input.category),
    description: input.description,
    start_at: input.date,
    end_at: input.endDate ?? input.date,
    venue_id: await resolveVenueId(input),
  };

  const event = input.id ? await updateEvent(input.id, payload) : await createEvent(payload);

  if (input.status === "pending") await submitEvent(event.id);
  else if (input.status === "ended") {
    await cancelEvent(event.id, "Event dibatalkan oleh organizer.");
  }

  const saved = await getEventById(event.id, { includeUnpublished: true });
  if (!saved) throw new ApiError("Event tidak ditemukan setelah disimpan.");
  return saved;
}

export interface SaveTicketTypeInput {
  id?: string;
  eventId: string;
  name: string;
  price: number;
  quota: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
  description: string;
  benefits: string[];
}

export async function saveTicketType(input: SaveTicketTypeInput): Promise<TicketType | null> {
  const payload = {
    name: input.name,
    description: input.description || undefined,
    price: input.price,
    total_quota: input.quota,
    sale_start: input.salesStart,
    sale_end: input.salesEnd,
    max_per_order: input.maxPerOrder,
    sort_order: 0,
  };

  const record = input.id
    ? await updateTicket(input.eventId, input.id, payload)
    : await createTicket(input.eventId, payload);
  return toTicketType(record, input.eventId);
}

/* -------------------- Endpoint backend: Event (publik) -------------------- */

export type EventQueryParams = {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

/** GET /api/v1/event-categories */
export async function listEventCategories(): Promise<ApiCategory[]> {
  return unwrap(await api.get<ApiResponse<ApiCategory[]>>("/event-categories"));
}

/** GET /api/v1/events — query param dikirim lewat URLSearchParams di api.get. */
export async function listEvents(params: EventQueryParams = {}): Promise<ApiEventList> {
  return unwrap(
    await api.get<ApiResponse<ApiEventList>>(
      "/events",
      params as Record<string, string | number>,
    ),
  );
}

/** GET /api/v1/events/:id */
export async function getPublicEvent(id: string): Promise<ApiEvent> {
  return unwrap(await api.get<ApiResponse<ApiEvent>>(`/events/${encodeURIComponent(id)}`));
}

/* ------------------- Endpoint backend: Event (organizer) ------------------ */

export type OrganizerEventQueryParams = {
  status?: "draft" | "pending_review" | "published" | "rejected" | "cancelled";
  page?: number;
  limit?: number;
};

export type CreateEventPayload = {
  title: string;
  description?: string;
  category_id: number;
  venue_id?: string;
  start_at: string;
  end_at: string;
};

export type UpdateEventPayload = Partial<CreateEventPayload>;

/** POST /api/v1/organizer/events */
export async function createEvent(payload: CreateEventPayload): Promise<ApiEvent> {
  return unwrap(await api.post<ApiResponse<ApiEvent>>("/organizer/events", payload));
}

/** GET /api/v1/organizer/events */
export async function listOrganizerEvents(
  params: OrganizerEventQueryParams = {},
): Promise<ApiOrganizerEventList> {
  return unwrap(
    await api.get<ApiResponse<ApiOrganizerEventList>>(
      "/organizer/events",
      params as Record<string, string | number>,
    ),
  );
}

/** GET /api/v1/organizer/events/:id */
export async function getOrganizerEvent(id: string): Promise<ApiOrganizerEvent> {
  return unwrap(
    await api.get<ApiResponse<ApiOrganizerEvent>>(
      `/organizer/events/${encodeURIComponent(id)}`,
    ),
  );
}

/** PUT /api/v1/organizer/events/:id */
export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<ApiEvent> {
  return unwrap(
    await api.put<ApiResponse<ApiEvent>>(
      `/organizer/events/${encodeURIComponent(id)}`,
      payload,
    ),
  );
}

/** DELETE /api/v1/organizer/events/:id */
export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/organizer/events/${encodeURIComponent(id)}`);
}

/** POST /api/v1/organizer/events/:id/submit */
export async function submitEvent(id: string): Promise<ApiEvent> {
  return unwrap(
    await api.post<ApiResponse<ApiEvent>>(
      `/organizer/events/${encodeURIComponent(id)}/submit`,
    ),
  );
}

/** POST /api/v1/organizer/events/:id/cancel */
export async function cancelEvent(id: string, reason: string): Promise<ApiEvent> {
  return unwrap(
    await api.post<ApiResponse<ApiEvent>>(
      `/organizer/events/${encodeURIComponent(id)}/cancel`,
      { reason },
    ),
  );
}
