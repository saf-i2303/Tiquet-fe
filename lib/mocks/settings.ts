export interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  at: string;
}

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    actor: "Rina Pratiwi",
    actorRole: "Super Admin",
    action: "Memverifikasi organizer",
    target: "Neon Entertainment",
    at: "2025-03-06T10:00:00+07:00",
  },
  {
    id: "LOG-002",
    actor: "Rina Pratiwi",
    actorRole: "Super Admin",
    action: "Menyetujui publikasi event",
    target: "Startup Summit Asia 2027",
    at: "2026-10-02T11:30:00+07:00",
  },
  {
    id: "LOG-003",
    actor: "Sari Wulandari",
    actorRole: "Organizer",
    action: "Mengajukan event untuk moderasi",
    target: "Neon Afterparty",
    at: "2026-11-01T09:10:00+07:00",
  },
  {
    id: "LOG-004",
    actor: "System",
    actorRole: "System",
    action: "Pembayaran terverifikasi via webhook",
    target: "ORD-1005",
    at: "2026-11-05T19:20:00+07:00",
  },
  {
    id: "LOG-005",
    actor: "System",
    actorRole: "System",
    action: "Check-in tiket tercatat",
    target: "TKT-1001-1 — Gate A",
    at: "2026-12-20T18:42:00+07:00",
  },
];

export const platformSettings = {
  serviceFee: 15_000,
  maxTicketsPerOrder: 6,
  autoApproveOrganizer: false,
  eventModeration: true,
  payoutSchedule: "Mingguan (setiap Selasa)",
  supportEmail: "help@tiketku.id",
  supportPhone: "+62 812 0000 0000",
};

export type PlatformSettings = typeof platformSettings;
