"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payouts } from "@/lib/mocks/organizers";
import { auditLogs } from "@/lib/mocks/settings";
import { requireRole } from "@/lib/guards";
import { getEventById, saveEvent, saveTicketType, setEventStatus } from "@/services/event.service";
import { getOrganizer } from "@/services/organizer.service";
import type { Event, EventCategory } from "@/types/event";
import type { OrganizerMember, OrganizerPayout } from "@/types/organizer";

function toIso(value: string, fallback: string): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function log(actor: string, action: string, target: string) {
  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-5)}`,
    actor,
    actorRole: "Organizer",
    action,
    target,
    at: new Date().toISOString(),
  });
}

export async function saveEventAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizerId = session.organizerId ?? "org-001";
  const organizer = await getOrganizer(organizerId);

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const date = String(formData.get("date") ?? "");

  if (!title || !venue || !date) {
    redirect(id ? `/organizer/events/${id}/edit?error=required` : "/organizer/events/new?error=required");
  }

  const current = id ? await getEventById(id, { includeUnpublished: true }) : undefined;
  const requested = String(formData.get("status") ?? "draft");
  let status: Event["status"] = "draft";
  if (requested === "pending") status = "pending";
  if (requested === "published" && current?.status === "published") status = "published";

  const event = await saveEvent({
    id: id || undefined,
    organizerId,
    organizerName: organizer?.name ?? session.name,
    title,
    category: String(formData.get("category") ?? "music") as EventCategory,
    city: String(formData.get("city") ?? "Jakarta"),
    venue,
    address: String(formData.get("address") ?? venue),
    date: toIso(date, new Date().toISOString()),
    endDate: formData.get("endDate")
      ? toIso(String(formData.get("endDate")), eventDateFallback(date))
      : undefined,
    description: String(formData.get("description") ?? ""),
    status,
  });

  log(
    session.name,
    id ? "Memperbarui event" : "Membuat event baru",
    `${event.title}${status === "pending" ? " (diajukan moderasi)" : ""}`,
  );

  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/events/${event.id}`);
  revalidatePath("/events");
  revalidatePath("/admin/events");
  redirect(`/organizer/events/${event.id}?saved=1`);
}

function eventDateFallback(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export async function submitEventAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizerId = session.organizerId ?? "org-001";
  const eventId = String(formData.get("eventId") ?? "");
  const event = await getEventById(eventId, { includeUnpublished: true });

  if (!event || event.organizerId !== organizerId) redirect("/organizer/events");
  if (event.ticketTypes.length === 0) {
    redirect(`/organizer/events/${eventId}?error=tickets`);
  }
  if (event.status === "published") {
    redirect(`/organizer/events/${eventId}`);
  }

  await setEventStatus(eventId, "pending");
  log(session.name, "Mengajukan event untuk moderasi", event.title);

  revalidatePath(`/organizer/events/${eventId}`);
  revalidatePath("/organizer/events");
  revalidatePath("/organizer");
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  redirect(`/organizer/events/${eventId}?submitted=1`);
}

export async function saveTicketTypeAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");

  const eventId = String(formData.get("eventId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const quota = Number(formData.get("quota") ?? 0);

  if (!eventId || !name || price <= 0 || quota <= 0) {
    redirect(`/organizer/events/${eventId}/tickets?error=required`);
  }

  const ticket = await saveTicketType({
    id: String(formData.get("ticketTypeId") ?? "") || undefined,
    eventId,
    name,
    price,
    quota,
    maxPerOrder: Number(formData.get("maxPerOrder") ?? 4),
    salesStart: toIso(String(formData.get("salesStart") ?? ""), new Date().toISOString()),
    salesEnd: toIso(String(formData.get("salesEnd") ?? ""), new Date().toISOString()),
    description: String(formData.get("description") ?? ""),
    benefits: String(formData.get("benefits") ?? "")
      .split(",")
      .map((benefit) => benefit.trim())
      .filter(Boolean),
  });

  if (ticket) log(session.name, "Mengatur kategori tiket", `${name} · ${eventId}`);

  revalidatePath(`/organizer/events/${eventId}`);
  revalidatePath(`/organizer/events/${eventId}/tickets`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/organizer/events");
  redirect(`/organizer/events/${eventId}/tickets?saved=1`);
}

export async function updateOrganizerProfileAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizer = await getOrganizer(session.organizerId ?? "org-001");
  if (!organizer) redirect("/organizer/profile?error=not-found");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !email) redirect("/organizer/profile?error=required");

  Object.assign(organizer, { name, email, phone, city, description });
  log(session.name, "Memperbarui profil organizer", organizer.name);

  revalidatePath("/organizer/profile");
  redirect("/organizer/profile?saved=1");
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizer = await getOrganizer(session.organizerId ?? "org-001");
  if (!organizer) redirect("/organizer/verification?error=not-found");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/organizer/verification?error=file");
  }
  if (file.size > 5 * 1024 * 1024) {
    redirect("/organizer/verification?error=size");
  }

  const type = String(formData.get("type") ?? "").trim() || "Dokumen pendukung";
  organizer.documents.push({
    id: `doc-${Date.now().toString().slice(-5)}`,
    type,
    name: file.name,
    uploadedAt: new Date().toISOString(),
    status: "pending",
  });
  if (organizer.status === "rejected" || organizer.status === "suspended") {
    organizer.status = "pending";
  }
  log(session.name, "Mengunggah dokumen verifikasi", `${type} · ${file.name}`);

  revalidatePath("/organizer/verification");
  revalidatePath("/admin/organizers");
  revalidatePath(`/admin/organizers/${organizer.id}`);
  redirect("/organizer/verification?uploaded=1");
}

export async function submitVerificationAction(): Promise<void> {
  const session = await requireRole("organizer");
  const organizer = await getOrganizer(session.organizerId ?? "org-001");
  if (!organizer) redirect("/organizer/verification?error=not-found");
  if (organizer.status === "verified") redirect("/organizer/verification?submitted=1");
  if (organizer.documents.length === 0) {
    redirect("/organizer/verification?error=documents");
  }

  organizer.status = "pending";
  for (const document of organizer.documents) {
    document.status = "pending";
  }
  log(session.name, "Mengajukan verifikasi organizer", organizer.name);

  revalidatePath("/organizer/verification");
  revalidatePath("/organizer");
  revalidatePath("/admin/organizers");
  revalidatePath(`/admin/organizers/${organizer.id}`);
  redirect("/organizer/verification?submitted=1");
}

export async function inviteMemberAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizer = await getOrganizer(session.organizerId ?? "org-001");
  if (!organizer) redirect("/organizer/team?error=not-found");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = (String(formData.get("role") ?? "staff") as OrganizerMember["role"]) ?? "staff";

  if (!name || !email) redirect("/organizer/team?error=required");

  organizer.members.push({
    id: `mem-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role,
    status: "invited",
    assignedEvents: [],
  });
  log(session.name, "Mengundang anggota tim", `${name} · ${role}`);

  revalidatePath("/organizer/team");
  redirect("/organizer/team?invited=1");
}

export async function requestPayoutAction(formData: FormData): Promise<void> {
  const session = await requireRole("organizer");
  const organizerId = session.organizerId ?? "org-001";
  const amount = Number(formData.get("amount") ?? 0);
  if (amount <= 0) redirect("/organizer/payouts?error=amount");

  const fee = Math.round(amount * 0.03);
  const payout: OrganizerPayout = {
    id: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    organizerId,
    period: String(formData.get("period") ?? "Periode berjalan"),
    amount,
    fee,
    net: amount - fee,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };

  payouts.unshift(payout);
  log(session.name, "Mengajukan pencairan dana", payout.id);

  revalidatePath("/organizer/payouts");
  revalidatePath("/admin/payouts");
  revalidatePath("/admin");
  redirect("/organizer/payouts?requested=1");
}
