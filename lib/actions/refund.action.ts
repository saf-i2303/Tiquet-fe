"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { refunds } from "@/lib/mocks/refunds";
import { auditLogs } from "@/lib/mocks/settings";
import type { RefundStatus } from "@/types/refund";

/**
 * Server action stub untuk keputusan refund Super Admin.
 * TODO: validasi status dan persetujuan wajib dilakukan ulang di backend
 * (plan.md poin 9), frontend hanya mengirim keputusan ke API.
 */
export async function updateRefundStatusAction(formData: FormData): Promise<void> {
  await requireRole("super_admin", "/admin/refunds");

  const refundId = String(formData.get("refundId") ?? "");
  const status = String(formData.get("status") ?? "approved") as RefundStatus;
  const refund = refunds.find((item) => item.id === refundId);

  if (refund) {
    refund.status = status;
    refund.resolvedAt =
      status === "refunded" || status === "rejected" ? new Date().toISOString() : undefined;

    auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-5)}`,
      actor: "Rina Pratiwi",
      actorRole: "Super Admin",
      action:
        status === "rejected" ? "Menolak pengajuan refund" : "Memperbarui status refund",
      target: `${refund.id} — ${refund.orderId}`,
      at: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/refunds");
  revalidatePath("/admin/refunds/[id]", "page");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin");
  redirect("/admin/refunds?saved=1");
}
