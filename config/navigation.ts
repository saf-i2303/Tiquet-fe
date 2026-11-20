export interface NavItem {
  href: string;
  label: string;
  icon:
    | "dashboard"
    | "events"
    | "ticket"
    | "orders"
    | "verification"
    | "report"
    | "transaction"
    | "refund"
    | "team"
    | "payout"
    | "users"
    | "organizers"
    | "moderation"
    | "activity"
    | "settings";
}

export const organizerNav: NavItem[] = [
  { href: "/organizer", label: "Dashboard", icon: "dashboard" },
  { href: "/organizer/events", label: "Event", icon: "events" },
  { href: "/organizer/reports", label: "Laporan Penjualan", icon: "report" },
  { href: "/organizer/transactions", label: "Transaksi", icon: "transaction" },
  { href: "/organizer/team", label: "Tim & Petugas", icon: "team" },
  { href: "/organizer/payouts", label: "Pencairan Dana", icon: "payout" },
  { href: "/organizer/verification", label: "Verifikasi", icon: "verification" },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Pengguna", icon: "users" },
  { href: "/admin/organizers", label: "Verifikasi EO", icon: "organizers" },
  { href: "/admin/events", label: "Moderasi Event", icon: "moderation" },
  { href: "/admin/transactions", label: "Transaksi", icon: "transaction" },
  { href: "/admin/refunds", label: "Refund", icon: "refund" },
  { href: "/admin/payouts", label: "Pencairan Dana", icon: "payout" },
  { href: "/admin/activity", label: "Aktivitas", icon: "activity" },
  { href: "/admin/settings", label: "Kebijakan", icon: "settings" },
];

export const customerNav: NavItem[] = [
  { href: "/events", label: "Events", icon: "events" },
  { href: "/tickets", label: "Tiket Saya", icon: "ticket" },
  { href: "/orders", label: "Riwayat", icon: "orders" },
];
