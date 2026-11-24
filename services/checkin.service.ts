import type { CheckIn } from "@/types/checkin";
import type { Ticket } from "@/types/ticket";

/**
 * Riwayat scan disimpan lokal di browser karena backend belum punya endpoint
 * check-in. Data ini dipakai dashboard gate staff dan diberi label "lokal".
 */
const LOCAL_CHECKINS_KEY = "tiquet:gate:checkins:v1";
const MAX_LOCAL_CHECKINS = 100;

function storageKey(staffId?: string): string {
  return staffId ? `${LOCAL_CHECKINS_KEY}:${staffId}` : LOCAL_CHECKINS_KEY;
}

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CheckIn>;
  return (
    typeof item.id === "string" &&
    typeof item.ticketId === "string" &&
    typeof item.eventId === "string" &&
    typeof item.eventTitle === "string" &&
    typeof item.holderName === "string" &&
    typeof item.gate === "string" &&
    typeof item.staffName === "string" &&
    (item.result === "valid" ||
      item.result === "duplicate" ||
      item.result === "invalid") &&
    typeof item.at === "string"
  );
}

function readLocalCheckIns(staffId?: string): CheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(staffId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCheckIn).sort((a, b) => b.at.localeCompare(a.at));
  } catch {
    return [];
  }
}

function writeLocalCheckIns(items: CheckIn[], staffId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(staffId), JSON.stringify(items));
  } catch {
    // localStorage bisa penuh/diblokir; riwayat lokal bersifat best-effort.
  }
}

/** Ambil riwayat scan lokal, opsional difilter per event dan/atau staff. */
export async function getCheckIns(
  eventId?: string,
  staffId?: string,
): Promise<CheckIn[]> {
  const items = readLocalCheckIns(staffId);
  return eventId ? items.filter((item) => item.eventId === eventId) : items;
}

export async function getCheckInSummary(eventId?: string, staffId?: string) {
  const items = await getCheckIns(eventId, staffId);
  return {
    valid: items.filter((item) => item.result === "valid").length,
    duplicate: items.filter((item) => item.result === "duplicate").length,
    invalid: items.filter((item) => item.result === "invalid").length,
    total: items.length,
  };
}

/** Simpan satu hasil scan ke riwayat lokal (valid/duplikat/invalid tetap dicatat). */
export function recordLocalCheckIn(
  rawValue: string,
  verification: TicketScanVerification,
  staffName: string,
  staffId?: string,
): CheckIn {
  const ticket = verification.ticket;
  const entry: CheckIn = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ticketId: ticket?.id ?? rawValue,
    eventId: ticket?.eventId ?? "UNKNOWN",
    eventTitle: ticket?.eventTitle ?? "Tiket tidak dikenal",
    holderName: ticket?.holderName || "Pemegang tidak diketahui",
    gate: verification.gate,
    staffName: staffName || "Gate Staff",
    result: verification.result,
    at: verification.at,
  };

  writeLocalCheckIns(
    [entry, ...readLocalCheckIns(staffId)].slice(0, MAX_LOCAL_CHECKINS),
    staffId,
  );
  return entry;
}

/** Hapus riwayat scan lokal milik staff ini (atau semua bila staffId kosong). */
export function clearLocalCheckIns(staffId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(staffId));
  } catch {
    // Abaikan kegagalan akses localStorage.
  }
}

/* --------------------- MOCK VERIFIKASI QR TIKET -------------------- */

export type TicketScanResult = CheckIn["result"];

export interface TicketScanVerification {
  result: TicketScanResult;
  message: string;
  gate: string;
  /** Waktu verifikasi dari "server" (dalam simulasi ini: lokal). */
  at: string;
  ticket?: Ticket;
}

const GATE_NAME = "Gate A - Utara";

const MOCK_EVENTS: Record<
  string,
  Pick<Ticket, "eventTitle" | "eventDate" | "venue" | "city">
> = {
  "EVT-JAK-001": {
    eventTitle: "Java Jazz Festival 2026",
    eventDate: "2026-12-12T19:00:00+07:00",
    venue: "JIExpo Kemayoran",
    city: "Jakarta",
  },
  "EVT-BDG-002": {
    eventTitle: "Bandung Music Summit 2027",
    eventDate: "2027-01-16T16:00:00+07:00",
    venue: "Trans Convention Center",
    city: "Bandung",
  },
  DEFAULT: {
    eventTitle: "Event Tiquet",
    eventDate: "2026-12-01T19:00:00+07:00",
    venue: "Lokasi acara",
    city: "Jakarta",
  },
};

/** Data dummy tiket yang realistis untuk alur scan -> validasi -> status UI. */
const MOCK_SCAN_TICKETS: Ticket[] = [
  {
    id: "TKT-ORD-2026-001-1",
    orderId: "ORD-2026-001",
    eventId: "EVT-JAK-001",
    ...MOCK_EVENTS["EVT-JAK-001"],
    ticketTypeName: "Daily Pass",
    holderName: "Andi Saputra",
    status: "active",
    qrToken: "TKTKU-ORD-2026-001-1-EVT-JAK-001",
  },
  {
    id: "TKT-ORD-2026-002-1",
    orderId: "ORD-2026-002",
    eventId: "EVT-BDG-002",
    ...MOCK_EVENTS["EVT-BDG-002"],
    ticketTypeName: "VIP",
    holderName: "Sari Wulandari",
    status: "used",
    checkedInAt: "2026-11-24T09:15:00+07:00",
    qrToken: "TKTKU-ORD-2026-002-1-EVT-BDG-002",
  },
];

/**
 * Token contoh untuk mencoba tiga hasil verifikasi tanpa kamera.
 * Tombol demo di scanner memanggil fungsi yang sama dengan scan asli.
 */
export const DEMO_SCAN_TOKENS = {
  valid: MOCK_SCAN_TICKETS[0].qrToken,
  duplicate: MOCK_SCAN_TICKETS[1].qrToken,
  invalid: "QR-TIDAK-DIKENAL",
};

/** Simulasi state "sudah dipakai" di server; QR hanya berlaku satu kali scan. */
const usedTokens = new Set<string>([DEMO_SCAN_TOKENS.duplicate]);

/**
 * Token yang dibuat QrPlaceholder mengikuti format ticketServices.ts:
 * TKTKU-<orderId>-<nomor tiket>-<eventId>. Token yang belum ada di data dummy
 * tetap dikenali supaya QR dari halaman e-ticket bisa di-scan saat preview.
 */
function ticketFromToken(token: string): Ticket | null {
  const match = /^TKTKU-(.+)-(\d+)-(.+)$/.exec(token);
  if (!match) return null;

  const [, orderId, sequence, eventId] = match;
  return {
    id: `TKT-${orderId}-${sequence}`,
    orderId,
    eventId,
    ...(MOCK_EVENTS[eventId] ?? MOCK_EVENTS.DEFAULT),
    ticketTypeName: "General Admission",
    holderName: "Pemegang Tiket",
    status: "active",
    qrToken: token,
  };
}

/**
 * PLACEHOLDER API CHECK-IN — GANTI INI SAAT BACKEND SIAP.
 * ------------------------------------------------------------------
 * Endpoint tiket/check-in belum tersedia, jadi verifikasi dilakukan lokal
 * dari data dummy di atas (termasuk simulasi latency & token terpakai).
 *
 * Saat API tersedia, hapus MOCK_SCAN_TICKETS/usedTokens lalu ganti isi fungsi
 * ini dengan request lewat `api` di lib/api.ts, misalnya:
 *
 *   return unwrap(await api.post<ApiResponse<TicketScanVerification>>(
 *     "/gate/check-in",
 *     { qr_token: rawValue },
 *   ));
 *
 * Path, payload, dan bentuk respons menyesuaikan kontrak backend. Komponen
 * scanner tidak perlu diubah karena hanya memanggil `mockVerifyTicketScan`.
 */
export async function mockVerifyTicketScan(
  rawValue: string,
): Promise<TicketScanVerification> {
  const token = rawValue.trim();
  const at = new Date().toISOString();

  // Simulasi latency jaringan supaya state "Memverifikasi..." terlihat di UI.
  await new Promise<void>((resolve) => setTimeout(resolve, 400));

  const ticket =
    MOCK_SCAN_TICKETS.find((item) => item.qrToken === token) ??
    ticketFromToken(token);

  if (!ticket) {
    return {
      result: "invalid",
      message: "QR tidak dikenal. Pastikan QR berasal dari tiket Tiquet.",
      gate: GATE_NAME,
      at,
    };
  }

  if (ticket.status === "cancelled") {
    return {
      result: "invalid",
      message: "Tiket ini sudah dibatalkan dan tidak dapat digunakan.",
      ticket,
      gate: GATE_NAME,
      at,
    };
  }

  if (ticket.status === "used" || usedTokens.has(token)) {
    return {
      result: "duplicate",
      message: "Tiket ini sudah pernah di-check-in. Tolak masuk dan cek ulang.",
      ticket: { ...ticket, status: "used", checkedInAt: ticket.checkedInAt ?? at },
      gate: GATE_NAME,
      at,
    };
  }

  usedTokens.add(token);
  return {
    result: "valid",
    message: "Tiket valid. Check-in berhasil, silakan masuk.",
    ticket: { ...ticket, status: "used", checkedInAt: at },
    gate: GATE_NAME,
    at,
  };
}
