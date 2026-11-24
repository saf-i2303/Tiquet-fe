import { api, unwrap } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { EventWithStats } from "@/types/event";
import type {
  Attendee,
  Organizer,
  OrganizerDocumentStatus,
  OrganizerMember,
  OrganizerMemberRole,
  OrganizerMemberStatus,
  OrganizerPayout,
  OrganizerStatus,
} from "@/types/organizer";
import type { Order } from "@/types/order";
import { listEventCategories, listOrganizerEvents, toOrganizerEvent } from "@/services/eventServices";
import { listVenues } from "@/services/venueServices";

/* ------------------------ Ringkasan dan data UI ------------------------ */

function toOrganizerStatus(status?: string): OrganizerStatus {
  if (status === "verified") return "verified";
  if (status === "rejected") return "rejected";
  if (status === "suspended") return "suspended";
  return "pending";
}

function toMemberRole(role?: string): OrganizerMemberRole {
  if (role === "owner" || role === "manager" || role === "gate_staff") return role;
  return "staff";
}

function toMemberStatus(status?: string): OrganizerMemberStatus {
  return status === "invited" ? "invited" : "active";
}

export async function getOrganizer(_id: string): Promise<Organizer | undefined> {
  try {
    const [profile, documents, staff] = await Promise.all([
      getOrganizerProfile(),
      listOrganizerDocuments().catch(() => [] as OrganizerDocumentRecord[]),
      listStaff().catch(() => [] as StaffRecord[]),
    ]);

    return {
      id: profile.id,
      name: profile.name,
      ownerName: "",
      email: profile.contact_email ?? "",
      phone: profile.contact_phone ?? "",
      city: "",
      description: profile.description ?? "",
      status: toOrganizerStatus(profile.verification_status),
      joinedAt: profile.created_at ?? "",
      verifiedAt: profile.verified_at,
      documents: documents.map((document) => ({
        id: document.id,
        type: document.doc_type,
        name: document.file_name,
        uploadedAt: document.created_at ?? "",
        status: "pending" as OrganizerDocumentStatus,
      })),
      members: staff.map((member) => ({
        id: member.id,
        name: member.full_name,
        email: member.email,
        role: toMemberRole(member.member_role),
        status: toMemberStatus(member.status),
      })),
      events: 0,
      revenue: 0,
    };
  } catch {
    return undefined;
  }
}

export async function getOrganizerEvents(_organizerId: string): Promise<EventWithStats[]> {
  const [result, categories, venues] = await Promise.all([
    listOrganizerEvents({ limit: 100 }),
    listEventCategories().catch(() => []),
    listVenues().catch(() => []),
  ]);

  return result.items
    .map((item) => toOrganizerEvent(item, categories, venues))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Endpoint organizer/transactions belum tersedia. */
export async function getOrganizerTransactions(_organizerId: string): Promise<Order[]> {
  return [];
}

export async function getOrganizerStats(organizerId: string) {
  const organizerEvents = await getOrganizerEvents(organizerId);
  const transactions = await getOrganizerTransactions(organizerId);
  void transactions;

  return {
    revenue: 0,
    ticketsSold: 0,
    activeEvents: organizerEvents.filter((event) => event.status === "published").length,
    totalEvents: organizerEvents.length,
    transactions: 0,
    avgOrderValue: 0,
    attendees: [] as Attendee[],
  };
}

export async function getOrganizerMembers(_organizerId: string): Promise<OrganizerMember[]> {
  return (await listStaff().catch(() => [] as StaffRecord[])).map((member) => ({
    id: member.id,
    name: member.full_name,
    email: member.email,
    role: toMemberRole(member.member_role),
    status: toMemberStatus(member.status),
  }));
}

/** Endpoint organizer/payouts belum tersedia. */
export async function getOrganizerPayouts(_organizerId: string): Promise<OrganizerPayout[]> {
  return [];
}

/** Endpoint peserta/check-in belum tersedia. */
export async function getEventAttendees(_eventId: string): Promise<Attendee[]> {
  return [];
}

export async function getOrganizerRevenueByEvent(organizerId: string) {
  const events = await getOrganizerEvents(organizerId);
  return events.map((event) => ({
    eventId: event.id,
    title: event.title,
    revenue: 0,
    tickets: 0,
  }));
}

/* ------------------- Endpoint backend: Organizer (10) -------------------- */

export type OrganizerProfileRecord = {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  verification_status?: string;
  created_at?: string;
  verified_at?: string;
};

export type OrganizerDocumentRecord = {
  id: string;
  doc_type: "ktp" | "npwp" | "nib" | "akta" | "other";
  file_name: string;
  created_at?: string;
};

export type StaffRecord = {
  id: string;
  email: string;
  full_name: string;
  member_role?: string;
  status?: string;
};

export type OrganizerProfilePayload = {
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
};

/** POST /api/v1/organizer/profile */
export async function createOrganizerProfile(
  payload: OrganizerProfilePayload,
): Promise<OrganizerProfileRecord> {
  return unwrap(
    await api.post<ApiResponse<OrganizerProfileRecord>>("/organizer/profile", payload),
  );
}

/** GET /api/v1/organizer/profile */
export async function getOrganizerProfile(): Promise<OrganizerProfileRecord> {
  return unwrap(await api.get<ApiResponse<OrganizerProfileRecord>>("/organizer/profile"));
}

/** PUT /api/v1/organizer/profile */
export async function updateOrganizerProfile(
  payload: OrganizerProfilePayload,
): Promise<OrganizerProfileRecord> {
  return unwrap(
    await api.put<ApiResponse<OrganizerProfileRecord>>("/organizer/profile", payload),
  );
}

/** POST /api/v1/organizer/documents — metadata JSON, bukan multipart. */
export async function addOrganizerDocument(
  payload: { doc_type: OrganizerDocumentRecord["doc_type"]; file_name: string },
): Promise<OrganizerDocumentRecord> {
  return unwrap(
    await api.post<ApiResponse<OrganizerDocumentRecord>>("/organizer/documents", payload),
  );
}

/** GET /api/v1/organizer/documents */
export async function listOrganizerDocuments(): Promise<OrganizerDocumentRecord[]> {
  return unwrap(
    await api.get<ApiResponse<OrganizerDocumentRecord[]>>("/organizer/documents"),
  );
}

/** DELETE /api/v1/organizer/documents/:id */
export async function deleteOrganizerDocument(id: string): Promise<void> {
  await api.delete(`/organizer/documents/${encodeURIComponent(id)}`);
}

/** POST /api/v1/organizer/submit-verification */
export async function submitVerification(): Promise<OrganizerProfileRecord> {
  return unwrap(
    await api.post<ApiResponse<OrganizerProfileRecord>>("/organizer/submit-verification"),
  );
}

/** POST /api/v1/organizer/staff */
export async function createStaff(
  payload: { email: string; password: string; full_name: string },
): Promise<StaffRecord> {
  return unwrap(await api.post<ApiResponse<StaffRecord>>("/organizer/staff", payload));
}

/** GET /api/v1/organizer/staff */
export async function listStaff(): Promise<StaffRecord[]> {
  return unwrap(await api.get<ApiResponse<StaffRecord[]>>("/organizer/staff"));
}

/** DELETE /api/v1/organizer/staff/:user_id */
export async function deleteStaff(userId: string): Promise<void> {
  await api.delete(`/organizer/staff/${encodeURIComponent(userId)}`);
}
