import type { EventCategory } from "@/types/event";

export type Tone = "gold" | "navy" | "blue" | "green" | "red" | "amber" | "slate";

export const SERVICE_FEE = 15_000;
export const MAX_TICKETS_PER_ORDER = 6;
export const EVENTS_PER_PAGE = 6;

export const categoryMeta: Record<
  EventCategory,
  { label: string; icon: string; gradient: string }
> = {
  music: { label: "Musik", icon: "music", gradient: "from-navy-900 via-navy-700 to-blue-500" },
  conference: {
    label: "Konferensi",
    icon: "mic",
    gradient: "from-navy-900 via-accent-violet to-navy-700",
  },
  comedy: { label: "Komedi", icon: "smile", gradient: "from-navy-900 via-accent-orange to-gold-600" },
  workshop: {
    label: "Workshop",
    icon: "wrench",
    gradient: "from-navy-900 via-accent-teal to-blue-500",
  },
  festival: {
    label: "Festival",
    icon: "tent",
    gradient: "from-navy-900 via-accent-rose to-accent-orange",
  },
  sport: {
    label: "Olahraga",
    icon: "volleyball",
    gradient: "from-navy-900 via-navy-700 to-accent-teal",
  },
};

export const eventCategories = (Object.keys(categoryMeta) as EventCategory[]).map((value) => ({
  value,
  label: categoryMeta[value].label,
}));

export const orderStatusMeta: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Menunggu Pembayaran", tone: "amber" },
  paid: { label: "Lunas", tone: "green" },
  expired: { label: "Kedaluwarsa", tone: "slate" },
  cancelled: { label: "Dibatalkan", tone: "red" },
};

export const eventStatusMeta: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "slate" },
  pending: { label: "Menunggu Moderasi", tone: "amber" },
  published: { label: "Tayang", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
  ended: { label: "Selesai", tone: "navy" },
};

export const organizerStatusMeta: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Menunggu Verifikasi", tone: "amber" },
  verified: { label: "Terverifikasi", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
  suspended: { label: "Ditangguhkan", tone: "slate" },
};

export const ticketStatusMeta: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Aktif", tone: "green" },
  used: { label: "Sudah Check-in", tone: "slate" },
  cancelled: { label: "Dibatalkan", tone: "red" },
};

export const roleMeta: Record<string, { label: string; tone: Tone }> = {
  customer: { label: "Customer", tone: "slate" },
  organizer: { label: "Organizer", tone: "gold" },
  gate_staff: { label: "Gate Staff", tone: "blue" },
  super_admin: { label: "Super Admin", tone: "navy" },
};

export const userStatusMeta: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Aktif", tone: "green" },
  suspended: { label: "Ditangguhkan", tone: "red" },
};

export const payoutStatusMeta: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Menunggu", tone: "amber" },
  processing: { label: "Diproses", tone: "blue" },
  paid: { label: "Cair", tone: "green" },
};

export const refundStatusMeta: Record<string, { label: string; tone: Tone }> = {
  requested: { label: "Diajukan", tone: "amber" },
  approved: { label: "Disetujui", tone: "blue" },
  processing: { label: "Diproses", tone: "gold" },
  refunded: { label: "Sudah Dikembalikan", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
};

export const documentStatusMeta: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Menunggu", tone: "amber" },
  approved: { label: "Disetujui", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
};

export const memberStatusMeta: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Aktif", tone: "green" },
  invited: { label: "Diundang", tone: "amber" },
};

export const attendeeStatusMeta: Record<string, { label: string; tone: Tone }> = {
  checked_in: { label: "Check-in", tone: "green" },
  not_checked_in: { label: "Belum check-in", tone: "slate" },
};

export const roleFilters = [
  { value: "", label: "Semua" },
  { value: "customer", label: "Customer" },
  { value: "organizer", label: "Organizer" },
  { value: "gate_staff", label: "Gate Staff" },
  { value: "super_admin", label: "Super Admin" },
];

export const payoutStatusFilters = [
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "paid", label: "Cair" },
];

export const refundStatusFilters = [
  { value: "", label: "Semua" },
  { value: "requested", label: "Diajukan" },
  { value: "approved", label: "Disetujui" },
  { value: "processing", label: "Diproses" },
  { value: "refunded", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
];

export const attendeeStatusFilters = [
  { value: "", label: "Semua peserta" },
  { value: "checked_in", label: "Sudah check-in" },
  { value: "not_checked_in", label: "Belum check-in" },
];

export const memberRoleLabel: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  gate_staff: "Gate Staff",
};

export const cities = [
  "Jakarta",
  "Tangerang",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Bali",
];

export const sortOptions = [
  { value: "soonest", label: "Terdekat" },
  { value: "cheapest", label: "Termurah" },
  { value: "popular", label: "Terpopuler" },
];
