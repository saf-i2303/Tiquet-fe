import { refunds } from "@/lib/mocks/refunds";
import type { Refund } from "@/types/refund";

/**
 * Stub service untuk Refund Management.
 * TODO: ganti sumber data dengan pemanggilan API backend sesuai kontrak
 * Swagger/OpenAPI setelah endpoint /admin/refunds tersedia.
 */
export async function getRefunds(): Promise<Refund[]> {
  return [...refunds].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export async function getRefundById(id: string): Promise<Refund | undefined> {
  return refunds.find((refund) => refund.id === id);
}

export async function getRefundStats() {
  return {
    total: refunds.length,
    requested: refunds.filter((refund) => refund.status === "requested").length,
    inProgress: refunds.filter(
      (refund) => refund.status === "approved" || refund.status === "processing",
    ).length,
    completed: refunds.filter((refund) => refund.status === "refunded").length,
    rejected: refunds.filter((refund) => refund.status === "rejected").length,
  };
}
