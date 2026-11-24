import {
  eventStatusMeta,
  orderStatusMeta,
  organizerStatusMeta,
  type Tone,
} from "@/lib/constants";
import { getAccessToken } from "@/lib/api";
import { PREVIEW_MODE } from "@/lib/preview";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils";
import { getPlatformStats, getAllEvents, getPendingOrganizers } from "@/services/adminServices";
import { getCurrentUser, toSessionUser } from "@/services/authServices";
import { getCheckIns } from "@/services/checkin.service";
import { listOrders } from "@/services/order.service";
import {
  getOrganizerEvents,
  getOrganizerProfile,
  listStaff,
  type StaffRecord,
} from "@/services/organizerServices";
import type { EventWithStats } from "@/types/event";
import type { Role, SessionUser } from "@/types/user";

export type ProfileStatTone = "navy" | "gold" | "blue";

export type ProfileStatIcon =
  | "orders"
  | "paid"
  | "pending"
  | "wallet"
  | "events"
  | "published"
  | "team"
  | "verified"
  | "scan"
  | "today"
  | "valid"
  | "review"
  | "organizers"
  | "moderation";

export interface ProfileStat {
  label: string;
  value: string | number;
  hint?: string;
  tone: ProfileStatTone;
  icon: ProfileStatIcon;
}

export interface ProfileActivity {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  statusTone?: Tone;
  href?: string;
}

export interface ProfileInsights {
  stats: ProfileStat[];
  activities: ProfileActivity[];
  activityTitle: string;
  activityHref?: string;
  activityHrefLabel?: string;
  notice?: string;
  source: "backend" | "local" | "preview";
}

export interface AccountRecordResult {
  user: SessionUser;
  source: "database" | "local";
}

type InsightAccount = Partial<Pick<SessionUser, "id" | "organizerId">>;

function statusMeta(
  map: Record<string, { label: string; tone: Tone }>,
  value?: string,
) {
  const found = value ? map[value] : undefined;
  return {
    label: found?.label ?? value ?? "-",
    tone: found?.tone ?? ("slate" as Tone),
  };
}

/**
 * Ambil data akun terbaru dari tabel users lewat GET /auth/me.
 * Phone/city sengaja dipertahankan karena kolom itu belum ada di backend
 * dan hanya disimpan di perangkat.
 */
export async function fetchAccountRecord(
  session: SessionUser | null,
): Promise<AccountRecordResult | null> {
  if (PREVIEW_MODE || !session) return null;
  if (!(await getAccessToken())) return null;

  try {
    const fresh = toSessionUser(await getCurrentUser());
    return {
      user: {
        ...session,
        ...fresh,
        phone: session.phone,
        city: session.city,
        organizerId: session.organizerId ?? fresh.organizerId,
      },
      source: "database",
    };
  } catch {
    return null;
  }
}

function emptyInsights(role: Role): ProfileInsights {
  const stats: Record<Role, ProfileStat[]> = {
    customer: [
      { label: "Total pesanan", value: 0, tone: "navy", icon: "orders" },
      { label: "Pesanan lunas", value: 0, tone: "gold", icon: "paid" },
      { label: "Menunggu bayar", value: 0, tone: "blue", icon: "pending" },
      { label: "Total belanja", value: formatRupiah(0), tone: "gold", icon: "wallet" },
    ],
    organizer: [
      { label: "Total event", value: 0, tone: "navy", icon: "events" },
      { label: "Event tayang", value: 0, tone: "gold", icon: "published" },
      { label: "Anggota tim", value: 0, tone: "blue", icon: "team" },
      { label: "Verifikasi EO", value: "-", tone: "gold", icon: "verified" },
    ],
    gate_staff: [
      { label: "Total scan", value: 0, tone: "navy", icon: "scan" },
      { label: "Scan hari ini", value: 0, tone: "blue", icon: "today" },
      { label: "Check-in valid", value: 0, tone: "gold", icon: "valid" },
      { label: "Perlu tinjau", value: 0, tone: "gold", icon: "review" },
    ],
    super_admin: [
      { label: "EO terdaftar", value: 0, tone: "navy", icon: "organizers" },
      { label: "EO pending", value: 0, tone: "gold", icon: "verified" },
      { label: "Event tayang", value: 0, tone: "blue", icon: "published" },
      { label: "Event pending", value: 0, tone: "gold", icon: "moderation" },
    ],
  };

  return {
    stats: stats[role],
    activities: [],
    activityTitle: "Aktivitas akun",
    notice: PREVIEW_MODE
      ? "Mode preview aktif: ringkasan menampilkan nilai kosong karena tidak memanggil API."
      : "Ringkasan tersedia setelah sesi login terbaca.",
    source: PREVIEW_MODE ? "preview" : "local",
  };
}

async function customerInsights(): Promise<ProfileInsights> {
  const result = await listOrders({ page: 1, limit: 8 }).catch(() => null);
  const orders = result?.items ?? [];
  const paid = orders.filter((order) => order.status === "paid");
  const pending = orders.filter((order) => order.status === "pending");
  const spent = paid.reduce((total, order) => total + order.total, 0);

  return {
    stats: [
      {
        label: "Total pesanan",
        value: result?.pagination?.total_items ?? orders.length,
        hint: "Semua status",
        tone: "navy",
        icon: "orders",
      },
      {
        label: "Pesanan lunas",
        value: paid.length,
        hint: "Dari 8 pesanan terbaru",
        tone: "gold",
        icon: "paid",
      },
      {
        label: "Menunggu bayar",
        value: pending.length,
        hint: "Perlu tindak lanjut",
        tone: "blue",
        icon: "pending",
      },
      {
        label: "Total belanja",
        value: formatRupiah(spent),
        hint: "Dari pesanan lunas terbaru",
        tone: "gold",
        icon: "wallet",
      },
    ],
    activities: orders.slice(0, 5).map((order) => {
      const status = statusMeta(orderStatusMeta, order.status);
      return {
        id: order.id,
        title: order.eventTitle,
        subtitle: `${formatDate(order.createdAt)} · ${order.items.length} tiket`,
        meta: formatRupiah(order.total),
        status: status.label,
        statusTone: status.tone,
        href: `/orders/${order.id}`,
      };
    }),
    activityTitle: "Pesanan terbaru",
    activityHref: "/orders",
    activityHrefLabel: "Lihat semua",
    notice:
      "Ringkasan dihitung dari 8 pesanan terakhir. Daftar e-ticket belum tersedia di backend.",
    source: "backend",
  };
}

async function organizerInsights(account: InsightAccount): Promise<ProfileInsights> {
  const [profile, events, staff] = await Promise.all([
    getOrganizerProfile().catch(() => null),
    getOrganizerEvents(account.organizerId ?? "").catch(() => [] as EventWithStats[]),
    listStaff().catch(() => [] as StaffRecord[]),
  ]);

  const verification = statusMeta(organizerStatusMeta, profile?.verification_status);
  const published = events.filter((event) => event.status === "published").length;
  const activeStaff = staff.filter(
    (member) => !member.status || member.status === "active",
  ).length;

  const activities: ProfileActivity[] = [
    ...(profile
      ? [
          {
            id: `verification-${profile.id}`,
            title: `Verifikasi ${profile.name}`,
            subtitle: "Status terkini profil organizer",
            meta: profile.verified_at ? formatDate(profile.verified_at) : undefined,
            status: verification.label,
            statusTone: verification.tone,
            href: "/organizer/profile",
          },
        ]
      : []),
    ...events.slice(0, 4).map((event) => {
      const status = statusMeta(eventStatusMeta, event.status);
      return {
        id: event.id,
        title: event.title,
        subtitle: "Event organizer",
        meta: event.date ? formatDate(event.date) : undefined,
        status: status.label,
        statusTone: status.tone,
        href: `/organizer/events/${event.id}`,
      };
    }),
  ];

  return {
    stats: [
      {
        label: "Total event",
        value: events.length,
        hint: "Event yang dibuat",
        tone: "navy",
        icon: "events",
      },
      {
        label: "Event tayang",
        value: published,
        hint: "Status published",
        tone: "gold",
        icon: "published",
      },
      {
        label: "Anggota tim",
        value: activeStaff,
        hint: `Dari ${staff.length} akun`,
        tone: "blue",
        icon: "team",
      },
      {
        label: "Verifikasi EO",
        value: verification.label,
        hint: profile?.verified_at ? formatDate(profile.verified_at) : "Belum diverifikasi",
        tone: "gold",
        icon: "verified",
      },
    ],
    activities,
    activityTitle: "Aktivitas organizer",
    activityHref: "/organizer/events",
    activityHrefLabel: "Kelola event",
    notice:
      "Pendapatan, transaksi, dan check-in belum tersedia di backend; ringkasan ini memakai data event, tim, dan verifikasi.",
    source: "backend",
  };
}

async function gateInsights(account: InsightAccount): Promise<ProfileInsights> {
  const checkIns = await getCheckIns(undefined, account.id).catch(() => []);
  const today = new Date().toDateString();
  const valid = checkIns.filter((item) => item.result === "valid").length;
  const todayCount = checkIns.filter(
    (item) => new Date(item.at).toDateString() === today,
  ).length;
  const needsReview = checkIns.filter((item) => item.result !== "valid").length;

  return {
    stats: [
      {
        label: "Total scan",
        value: checkIns.length,
        hint: "Riwayat perangkat ini",
        tone: "navy",
        icon: "scan",
      },
      {
        label: "Scan hari ini",
        value: todayCount,
        tone: "blue",
        icon: "today",
      },
      {
        label: "Check-in valid",
        value: valid,
        tone: "gold",
        icon: "valid",
      },
      {
        label: "Perlu tinjau",
        value: needsReview,
        hint: "Duplikat / tidak valid",
        tone: "gold",
        icon: "review",
      },
    ],
    activities: checkIns.slice(0, 5).map((item) => {
      const result = statusMeta(
        {
          valid: { label: "Valid", tone: "green" },
          duplicate: { label: "Duplikat", tone: "amber" },
          invalid: { label: "Tidak valid", tone: "red" },
        },
        item.result,
      );
      return {
        id: item.id,
        title: item.holderName,
        subtitle: item.eventTitle,
        meta: `${item.gate} · ${formatDateTime(item.at)}`,
        status: result.label,
        statusTone: result.tone,
      };
    }),
    activityTitle: "Riwayat scan terbaru",
    activityHref: "/dashboard",
    activityHrefLabel: "Dashboard scan",
    notice:
      "Riwayat scan disimpan di perangkat ini. Backend belum menyediakan endpoint check-in.",
    source: "local",
  };
}

async function adminInsights(): Promise<ProfileInsights> {
  const [platform, pending, events] = await Promise.all([
    getPlatformStats().catch(() => null),
    getPendingOrganizers().catch(() => []),
    getAllEvents().catch(() => [] as EventWithStats[]),
  ]);

  const activities: ProfileActivity[] = [
    ...pending.slice(0, 3).map((organizer) => ({
      id: `org-${organizer.id}`,
      title: organizer.name,
      subtitle: "Verifikasi organizer menunggu",
      meta: organizer.joinedAt ? formatDate(organizer.joinedAt) : undefined,
      status: "Menunggu",
      statusTone: "amber" as Tone,
      href: `/admin/organizers/${organizer.id}`,
    })),
    ...events.slice(0, 3).map((event) => {
      const status = statusMeta(eventStatusMeta, event.status);
      return {
        id: `event-${event.id}`,
        title: event.title,
        subtitle: "Event terbaru",
        meta: event.date ? formatDate(event.date) : undefined,
        status: status.label,
        statusTone: status.tone,
        href: `/admin/events/${event.id}`,
      };
    }),
  ];

  return {
    stats: [
      {
        label: "EO terdaftar",
        value: platform?.totalOrganizers ?? 0,
        tone: "navy",
        icon: "organizers",
      },
      {
        label: "EO pending",
        value: platform?.pendingOrganizers ?? pending.length,
        tone: "gold",
        icon: "verified",
      },
      {
        label: "Event tayang",
        value: platform?.publishedEvents ?? 0,
        tone: "blue",
        icon: "published",
      },
      {
        label: "Event pending",
        value: platform?.pendingEvents ?? 0,
        tone: "gold",
        icon: "moderation",
      },
    ],
    activities,
    activityTitle: "Antrean & aktivitas terbaru",
    activityHref: "/admin/organizers",
    activityHrefLabel: "Moderasi EO",
    notice:
      "Manajemen pengguna, transaksi, dan audit log belum tersedia di backend; ringkasan ini memakai data organizer dan event.",
    source: "backend",
  };
}

/** Ringkasan bawah profil, sudah dinormalisasi agar tampilannya seragam. */
export async function getProfileInsights(
  role: Role,
  account: InsightAccount | null,
): Promise<ProfileInsights> {
  if (role === "gate_staff") return gateInsights(account ?? {});

  if (
    PREVIEW_MODE ||
    !account?.id ||
    !(await getAccessToken())
  ) {
    return emptyInsights(role);
  }

  switch (role) {
    case "customer":
      return customerInsights();
    case "organizer":
      return organizerInsights(account);
    case "super_admin":
      return adminInsights();
    default:
      return emptyInsights(role);
  }
}
