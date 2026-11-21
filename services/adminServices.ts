import { api, unwrap } from "@/lib/api";
import { defaultPlatformSettings } from "@/types/admin";
import type { AuditLog, PlatformSettings } from "@/types/admin";
import type { ApiResponse, Paginated } from "@/types/api";
import type { EventWithStats } from "@/types/event";
import type { Organizer, OrganizerDocument, OrganizerStatus, OrganizerPayout } from "@/types/organizer";
import type { Order } from "@/types/order";
import type { User } from "@/types/user";
import { toEvent } from "@/services/eventServices";
import type { ApiEvent } from "@/services/eventServices";

export interface PayoutWithOrganizer extends OrganizerPayout {
  organizerName: string;
}

export interface AdminOrganizerDocument {
  id: string;
  doc_type: string;
  file_name: string;
  created_at?: string;
}

export interface AdminOrganizerRecord {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  verification_status?: string;
  created_at?: string;
  verified_at?: string;
  documents?: AdminOrganizerDocument[];
}

export type AdminQueryParams = {
  status?: string;
  page?: number;
  limit?: number;
};

/** Backend mengembalikan { items, pagination } untuk daftar admin. */
export type AdminPaginated<T> = Paginated<T>;

function toOrganizerStatus(status?: string): OrganizerStatus {
  if (status === "verified") return "verified";
  if (status === "rejected") return "rejected";
  if (status === "suspended") return "suspended";
  return "pending";
}

function toOrganizerDocument(item: AdminOrganizerDocument): OrganizerDocument {
  return {
    id: item.id,
    type: item.doc_type,
    name: item.file_name,
    uploadedAt: item.created_at ?? "",
    status: "pending",
  };
}

function toOrganizer(item: AdminOrganizerRecord): Organizer {
  return {
    id: item.id,
    name: item.name,
    ownerName: "",
    email: item.contact_email ?? "",
    phone: item.contact_phone ?? "",
    city: "",
    description: item.description ?? "",
    status: toOrganizerStatus(item.verification_status),
    joinedAt: item.created_at ?? "",
    verifiedAt: item.verified_at,
    documents: (item.documents ?? []).map(toOrganizerDocument),
    members: [],
    events: 0,
    revenue: 0,
  };
}

/* ------------------------ Ringkasan dan data UI ------------------------ */

export async function getPlatformStats() {
  const [organizers, pendingOrganizers, events] = await Promise.all([
    listAdminOrganizers({ limit: 100 }).catch(() => null),
    listAdminOrganizers({ status: "pending", limit: 100 }).catch(() => null),
    listAdminEvents({ limit: 100 }).catch(() => null),
  ]);

  const eventItems = events?.items ?? [];
  return {
    totalUsers: 0,
    totalOrganizers: organizers?.pagination.total_items ?? 0,
    pendingOrganizers: pendingOrganizers?.pagination.total_items ?? 0,
    publishedEvents: eventItems.filter((event) => event.status === "published").length,
    pendingEvents: eventItems.filter((event) => event.status === "pending_review").length,
    grossRevenue: 0,
    ticketsSold: 0,
    transactions: 0,
  };
}

/** Endpoint admin/users belum tersedia. */
export async function getUsers(): Promise<User[]> {
  return [];
}

export async function getUserById(_id: string): Promise<User | undefined> {
  return undefined;
}

export async function getOrganizersList(): Promise<Organizer[]> {
  const result = await listAdminOrganizers({ limit: 100 });
  return result.items.map(toOrganizer);
}

export async function getPendingOrganizers(): Promise<Organizer[]> {
  const result = await listAdminOrganizers({ status: "pending", limit: 100 });
  return result.items.map(toOrganizer).filter((item) => item.status === "pending");
}

export async function getOrganizerById(id: string): Promise<Organizer | undefined> {
  try {
    return toOrganizer(await getAdminOrganizer(id));
  } catch {
    return undefined;
  }
}

export async function getAllEvents(): Promise<EventWithStats[]> {
  const result = await listAdminEvents({ limit: 100 });
  return result.items.map((item) => toEvent(item)).sort((a, b) => b.date.localeCompare(a.date));
}

/** Endpoint admin/orders belum tersedia. */
export async function getAllOrders(): Promise<Order[]> {
  return [];
}

/** Endpoint admin/payouts belum tersedia. */
export async function getPayoutsList(): Promise<PayoutWithOrganizer[]> {
  return [];
}

/** Endpoint admin/activity belum tersedia. */
export async function getAuditLogs(): Promise<AuditLog[]> {
  return [];
}

/**
 * Preferensi platform belum punya endpoint backend. Nilai awal zero-value
 * dipakai supaya form tetap terender tanpa data dummy.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  return { ...defaultPlatformSettings };
}

export async function savePlatformSettings(
  settings: PlatformSettings,
): Promise<PlatformSettings> {
  return settings;
}

/* ---------------------- Endpoint backend: Admin (9) ---------------------- */

/** GET /api/v1/admin/organizers */
export async function listAdminOrganizers(
  params: AdminQueryParams = {},
): Promise<AdminPaginated<AdminOrganizerRecord>> {
  return unwrap(
    await api.get<ApiResponse<AdminPaginated<AdminOrganizerRecord>>>(
      "/admin/organizers",
      params as Record<string, string | number>,
    ),
  );
}

/** GET /api/v1/admin/organizers/:id */
export async function getAdminOrganizer(id: string): Promise<AdminOrganizerRecord> {
  return unwrap(
    await api.get<ApiResponse<AdminOrganizerRecord>>(
      `/admin/organizers/${encodeURIComponent(id)}`,
    ),
  );
}

/** POST /api/v1/admin/organizers/:id/verify */
export async function verifyOrganizer(id: string): Promise<AdminOrganizerRecord> {
  return unwrap(
    await api.post<ApiResponse<AdminOrganizerRecord>>(
      `/admin/organizers/${encodeURIComponent(id)}/verify`,
    ),
  );
}

/** POST /api/v1/admin/organizers/:id/reject */
export async function rejectOrganizer(
  id: string,
  reason: string,
): Promise<AdminOrganizerRecord> {
  return unwrap(
    await api.post<ApiResponse<AdminOrganizerRecord>>(
      `/admin/organizers/${encodeURIComponent(id)}/reject`,
      { reason },
    ),
  );
}

/** GET /api/v1/admin/events */
export async function listAdminEvents(
  params: AdminQueryParams = {},
): Promise<AdminPaginated<ApiEvent>> {
  return unwrap(
    await api.get<ApiResponse<AdminPaginated<ApiEvent>>>(
      "/admin/events",
      params as Record<string, string | number>,
    ),
  );
}

/** GET /api/v1/admin/events/:id */
export async function getAdminEvent(id: string): Promise<ApiEvent> {
  return unwrap(await api.get<ApiResponse<ApiEvent>>(`/admin/events/${encodeURIComponent(id)}`));
}

/** POST /api/v1/admin/events/:id/approve */
export async function approveEvent(id: string): Promise<ApiEvent> {
  return unwrap(
    await api.post<ApiResponse<ApiEvent>>(`/admin/events/${encodeURIComponent(id)}/approve`),
  );
}

/** POST /api/v1/admin/events/:id/reject */
export async function rejectEvent(id: string, reason: string): Promise<ApiEvent> {
  return unwrap(
    await api.post<ApiResponse<ApiEvent>>(
      `/admin/events/${encodeURIComponent(id)}/reject`,
      { reason },
    ),
  );
}

// GET /api/v1/admin/events/:event_id/tickets — didefinisikan sekali di ticketServices.
export { listAdminTickets } from "./ticketServices";
