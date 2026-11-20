"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditLogs, platformSettings } from "@/lib/mocks/settings";
import { events } from "@/lib/mocks/events";
import { organizers, payouts } from "@/lib/mocks/organizers";
import { users } from "@/lib/mocks/users";
import { requireRole } from "@/lib/guards";
import type { OrganizerPayout } from "@/types/organizer";

function log(actor: string, action: string, target: string, actorRole = "Super Admin") {
  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-5)}`,
    actor,
    actorRole,
    action,
    target,
    at: new Date().toISOString(),
  });
}

export async function verifyOrganizerAction(formData: FormData): Promise<void> {
  await requireRole("super_admin");

  const organizerId = String(formData.get("organizerId") ?? "");
  const decision = String(formData.get("decision") ?? "verified");
  const organizer = organizers.find((item) => item.id === organizerId);

  if (organizer) {
    organizer.status = decision === "rejected" ? "rejected" : "verified";
    organizer.verifiedAt = decision === "verified" ? new Date().toISOString() : undefined;
    for (const document of organizer.documents) {
      document.status = decision === "rejected" ? "rejected" : "approved";
    }
    log(
      "Rina Pratiwi",
      decision === "rejected" ? "Menolak verifikasi organizer" : "Memverifikasi organizer",
      organizer.name,
    );
  }

  revalidatePath("/admin/organizers");
  revalidatePath("/admin/organizers/[id]", "page");
  revalidatePath("/admin");
  revalidatePath("/organizer");
  revalidatePath("/organizer/verification");
  redirect("/admin/organizers?saved=1");
}

export async function moderateEventAction(formData: FormData): Promise<void> {
  await requireRole("super_admin");

  const eventId = String(formData.get("eventId") ?? "");
  const decision = String(formData.get("decision") ?? "published");
  const event = events.find((item) => item.id === eventId);

  if (event) {
    event.status = decision === "rejected" ? "rejected" : "published";
    log(
      "Rina Pratiwi",
      decision === "rejected" ? "Menolak publikasi event" : "Menyetujui publikasi event",
      event.title,
    );
  }

  revalidatePath("/admin/events");
  revalidatePath("/admin/events/[id]", "page");
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/organizer/events");
  revalidatePath("/organizer");
  redirect("/admin/events?saved=1");
}

export async function toggleUserStatusAction(formData: FormData): Promise<void> {
  await requireRole("super_admin");

  const userId = String(formData.get("userId") ?? "");
  const user = users.find((item) => item.id === userId);

  if (user) {
    user.status = user.status === "active" ? "suspended" : "active";
    log(
      "Rina Pratiwi",
      user.status === "suspended" ? "Menangguhkan pengguna" : "Mengaktifkan pengguna",
      user.name,
    );
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect("/admin/users?saved=1");
}

export async function updatePayoutStatusAction(formData: FormData): Promise<void> {
  await requireRole("super_admin");

  const payoutId = String(formData.get("payoutId") ?? "");
  const status = String(formData.get("status") ?? "processing") as OrganizerPayout["status"];
  const payout = payouts.find((item) => item.id === payoutId);

  if (payout) {
    payout.status = status;
    payout.paidAt = status === "paid" ? new Date().toISOString() : undefined;
    const organizer = organizers.find((item) => item.id === payout.organizerId);
    log(
      "Rina Pratiwi",
      status === "paid" ? "Menandai pencairan dana selesai" : "Memproses pencairan dana",
      `${payout.organizerId} — ${organizer?.name ?? "Organizer"}`,
    );
  }

  revalidatePath("/admin/payouts");
  revalidatePath("/organizer/payouts");
  revalidatePath("/admin");
  redirect("/admin/payouts?saved=1");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireRole("super_admin");

  platformSettings.serviceFee = Number(formData.get("serviceFee") ?? platformSettings.serviceFee);
  platformSettings.maxTicketsPerOrder = Number(
    formData.get("maxTicketsPerOrder") ?? platformSettings.maxTicketsPerOrder,
  );
  platformSettings.autoApproveOrganizer = formData.get("autoApproveOrganizer") === "on";
  platformSettings.eventModeration = formData.get("eventModeration") === "on";
  platformSettings.payoutSchedule = String(
    formData.get("payoutSchedule") ?? platformSettings.payoutSchedule,
  );
  platformSettings.supportEmail = String(formData.get("supportEmail") ?? platformSettings.supportEmail);
  platformSettings.supportPhone = String(formData.get("supportPhone") ?? platformSettings.supportPhone);

  log("Rina Pratiwi", "Memperbarui kebijakan platform", "Pengaturan umum");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
