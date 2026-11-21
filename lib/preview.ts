import type { Role, SessionUser } from "@/types/user";

/**
 * PREVIEW MODE
 * ---------------------------------------------------------------
 * Saat aktif, guard klien dilewati sehingga semua halaman bisa dibuka tanpa login.
 * Dipakai hanya untuk preview tampilan.
 *
 * Aktifkan secara eksplisit dengan env:
 *   NEXT_PUBLIC_PREVIEW_MODE=true
 * Default-nya mati supaya guard tidak fail-open.
 */
export const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export const DEMO_SESSIONS: Record<Role, SessionUser> = {
  customer: {
    id: "usr-001",
    name: "Andi Saputra",
    email: "andi@email.com",
    phone: "0812 1111 2222",
    city: "Jakarta",
    role: "customer",
  },
  organizer: {
    id: "usr-002",
    name: "Sari Wulandari",
    email: "sari@neon.id",
    phone: "0813 3333 4444",
    city: "Jakarta",
    role: "organizer",
    organizerId: "org-001",
  },
  gate_staff: {
    id: "usr-005",
    name: "Dimas Prakoso",
    email: "dimas@neon.id",
    phone: "0812 9999 0000",
    city: "Jakarta",
    role: "gate_staff",
    organizerId: "org-001",
  },
  super_admin: {
    id: "usr-004",
    name: "Rina Pratiwi",
    email: "admin@tiketku.id",
    phone: "0811 7777 8888",
    city: "Jakarta",
    role: "super_admin",
  },
};

/** Session demo untuk role tertentu (dipakai guard saat PREVIEW_MODE aktif). */
export function previewSession(role: Role): SessionUser {
  return DEMO_SESSIONS[role];
}
