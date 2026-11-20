"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditLogs } from "@/lib/mocks/settings";
import { requireAuth } from "@/lib/guards";
import { createOrder, payOrder } from "@/services/order.service";
import { getPaymentMethodById } from "@/services/payment.service";

export async function createOrderAction(formData: FormData): Promise<void> {
  const eventId = String(formData.get("eventId") ?? "");
  const session = await requireAuth(`/events/${eventId}/tickets`);

  const ticketTypeIds = formData.getAll("ticketTypeId").map(String);
  const quantities = formData.getAll("qty").map((value) => Number(value));

  const items = ticketTypeIds
    .map((ticketTypeId, index) => ({ ticketTypeId, qty: quantities[index] ?? 0 }))
    .filter((item) => item.qty > 0);

  if (!eventId || items.length === 0) {
    redirect(`/events/${eventId}/tickets?error=empty`);
  }

  const order = await createOrder({
    eventId,
    customer: session,
    items,
    customerPhone: String(formData.get("phone") ?? "") || session.phone,
  });

  if (!order) {
    redirect(`/events/${eventId}/tickets?error=invalid`);
  }

  revalidatePath("/orders");
  redirect(`/checkout/${order.id}`);
}

export async function payOrderAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const methodId = String(formData.get("methodId") ?? "pm-bca-va");
  await requireAuth(`/checkout/${orderId}`);

  const method = getPaymentMethodById(methodId);
  const order = await payOrder(orderId, method?.name ?? "BCA Virtual Account");

  if (!order) redirect("/orders");

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-5)}`,
    actor: "System",
    actorRole: "System",
    action: "Pembayaran terverifikasi via webhook",
    target: order.id,
    at: new Date().toISOString(),
  });

  revalidatePath(`/checkout/${orderId}/status`);
  revalidatePath("/tickets");
  revalidatePath("/orders");
  revalidatePath("/organizer");
  revalidatePath("/admin");
  redirect(`/checkout/${orderId}/status`);
}
