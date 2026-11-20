import type { Refund } from "@/types/refund";

/**
 * Fixture development saja. Diganti oleh kontrak API backend setelah
 * endpoint /refunds disepakati tim FE–BE (plan.md poin 7).
 */
export const refunds: Refund[] = [
  {
    id: "REF-001",
    orderId: "ORD-1001",
    customerId: "usr-001",
    customerName: "Andi Saputra",
    organizerName: "Neon Entertainment",
    amount: 1_715_000,
    reason: "Event dibatalkan oleh organizer.",
    status: "requested",
    requestedAt: "2026-11-06T09:15:00+07:00",
  },
  {
    id: "REF-002",
    orderId: "ORD-1003",
    customerId: "usr-003",
    customerName: "Budi Santoso",
    organizerName: "Nusantara Event",
    amount: 1_515_000,
    reason: "Peserta mengundurkan diri sebelum periode penjualan ditutup.",
    status: "approved",
    requestedAt: "2026-11-08T14:40:00+07:00",
  },
  {
    id: "REF-003",
    orderId: "ORD-1004",
    customerId: "usr-006",
    customerName: "Maya Anggraini",
    organizerName: "Soundscape Festival",
    amount: 650_000,
    reason: "Pembayaran terduplikat.",
    status: "processing",
    requestedAt: "2026-11-10T11:05:00+07:00",
  },
  {
    id: "REF-004",
    orderId: "ORD-1005",
    customerId: "usr-001",
    customerName: "Andi Saputra",
    organizerName: "Neon Entertainment",
    amount: 350_000,
    reason: "Kategori tiket tidak sesuai deskripsi.",
    status: "refunded",
    requestedAt: "2026-11-01T08:20:00+07:00",
    resolvedAt: "2026-11-03T16:10:00+07:00",
  },
  {
    id: "REF-005",
    orderId: "ORD-1006",
    customerId: "usr-003",
    customerName: "Budi Santoso",
    amount: 275_000,
    reason: "Permintaan di luar kebijakan refund platform.",
    status: "rejected",
    requestedAt: "2026-11-12T13:30:00+07:00",
    resolvedAt: "2026-11-13T09:00:00+07:00",
  },
];
