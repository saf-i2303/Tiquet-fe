/**
 * Kontrak tipe untuk modul Refund Management (plan.md modul backend ke-13).
 * Menyesuaikan struktur tabel `refunds` dan alur approval Super Admin.
 */
export type RefundStatus =
  | "requested"
  | "approved"
  | "processing"
  | "refunded"
  | "rejected";

export interface Refund {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  organizerId?: string;
  organizerName?: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  resolvedAt?: string;
}
