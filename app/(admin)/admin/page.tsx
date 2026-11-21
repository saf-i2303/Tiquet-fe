"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { QuickLinksCard } from "@/components/shared/quick-links-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import {
  eventStatusMeta,
  orderStatusMeta,
  organizerStatusMeta,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils";
import {
  getAuditLogs,
  getAllEvents,
  getAllOrders,
  getPendingOrganizers,
  getPlatformStats,
} from "@/services/adminServices";

const emptyStats = {
  totalUsers: 0,
  totalOrganizers: 0,
  pendingOrganizers: 0,
  publishedEvents: 0,
  pendingEvents: 0,
  grossRevenue: 0,
  ticketsSold: 0,
  transactions: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(emptyStats);
  const [pendingOrganizers, setPendingOrganizers] = useState<Awaited<ReturnType<typeof getPendingOrganizers>>>([]);
  const [allEvents, setAllEvents] = useState<Awaited<ReturnType<typeof getAllEvents>>>([]);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAllOrders>>>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getAuditLogs>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      getPlatformStats(),
      getPendingOrganizers(),
      getAllEvents(),
      getAllOrders(),
      getAuditLogs(),
    ])
      .then(([nextStats, nextPending, nextEvents, nextOrders, nextLogs]) => {
        if (!active) return;
        setStats(nextStats);
        setPendingOrganizers(nextPending);
        setAllEvents(nextEvents);
        setOrders(nextOrders);
        setLogs(nextLogs);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pendingEventList = allEvents
    .filter((event) => event.status === "pending")
    .slice(0, 5);

  return (
    <main>
      {isLoading && (
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      )}
      {errorMsg && (
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      <PageHeader
        kicker="Control center"
        title="Dashboard super admin"
        subtitle="Pantau kesehatan platform, moderasi konten, dan aktivitas penting pengguna."
        action={
          <ButtonLink href="/admin/events" size="sm">
            <ShieldCheck className="h-4 w-4" /> Moderasi event
          </ButtonLink>
        }
      />

      <div className="stat-grid mb-6">
        <StatTile
          label="GMV platform"
          value={formatRupiah(stats.grossRevenue)}
          hint={`${stats.transactions} transaksi`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Tiket terjual"
          value={stats.ticketsSold.toLocaleString("id-ID")}
          hint="Dari order lunas"
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Pengguna"
          value={stats.totalUsers}
          hint={`${stats.totalOrganizers} organizer`}
          icon={<Users className="h-4 w-4" />}
          tone="blue"
        />
        <StatTile
          label="Event tayang"
          value={stats.publishedEvents}
          hint={`${stats.pendingEvents} menunggu moderasi`}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="gold"
        />
      </div>

      <QuickLinksCard
        className="mb-6"
        items={[
          {
            href: "/admin/organizers",
            label: "Verifikasi EO",
            icon: <BadgeCheck className="h-4 w-4" />,
          },
          {
            href: "/admin/events",
            label: "Moderasi event",
            icon: <ShieldCheck className="h-4 w-4" />,
          },
          {
            href: "/admin/payouts",
            label: "Proses pencairan dana",
            icon: <Wallet className="h-4 w-4" />,
          },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-stack">
          <Card className="overflow-hidden">
            <CardHeader
              title="Antrean verifikasi organizer"
              className="p-4"
              action={
                <ButtonLink href="/admin/organizers" variant="ghost" size="sm">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              }
            />
            {pendingOrganizers.length === 0 ? (
              <EmptyState
                title="Tidak ada pengajuan verifikasi baru."
                className="m-4"
              />
            ) : (
              <div className="divide-y divide-line border-t border-line">
                {pendingOrganizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy-900">
                        {organizer.name}
                      </div>
                      <div className="text-xs text-muted">
                        {organizer.ownerName} · {organizer.city} · diajukan{" "}
                        {formatDate(organizer.joinedAt, { dateStyle: "medium" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={organizer.status} map={organizerStatusMeta} />
                      <ButtonLink
                        href={`/admin/organizers/${organizer.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Review
                      </ButtonLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Event menunggu moderasi"
              className="p-4"
              action={
                <ButtonLink href="/admin/events" variant="ghost" size="sm">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              }
            />
            {pendingEventList.length === 0 ? (
              <EmptyState title="Tidak ada event yang menunggu." className="m-4" />
            ) : (
              <div className="divide-y divide-line border-t border-line">
                {pendingEventList.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy-900">{event.title}</div>
                      <div className="text-xs text-muted">
                        {event.organizerName} · {event.venue} ·{" "}
                        {formatDate(event.date, { dateStyle: "medium" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={event.status} map={eventStatusMeta} />
                      <ButtonLink
                        href={`/admin/events/${event.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Review
                      </ButtonLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Transaksi terbaru"
              className="p-4"
              action={
                <ButtonLink href="/admin/transactions" variant="ghost" size="sm">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              }
            />
            <TableShell>
              <table className="w-full min-w-[720px]">
                <thead className="bg-surface">
                  <tr>
                    <th className="th">Order</th>
                    <th className="th">Event</th>
                    <th className="th">Pembeli</th>
                    <th className="th">Total</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="td font-mono text-xs">{order.id}</td>
                      <td className="td">
                        <div className="max-w-48 truncate text-sm">{order.eventTitle}</div>
                      </td>
                      <td className="td text-xs">{order.customerName}</td>
                      <td className="td">
                        <Price value={order.total} />
                      </td>
                      <td className="td">
                        <StatusBadge value={order.status} map={orderStatusMeta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </Card>
        </div>

        <aside className="section-stack">
          <section className="card p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-navy-600" /> Aktivitas terbaru
                </span>
              }
            />
            <ol className="mt-3 space-y-3">
              {logs.slice(0, 5).map((log) => (
                <li key={log.id} className="border-l-2 border-line pl-3">
                  <div className="text-sm font-semibold text-navy-900">{log["action"]}</div>
                  <div className="text-xs text-muted">{log.target}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {log.actor} · {formatDateTime(log.at)}
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink
              href="/admin/activity"
              variant="outline"
              size="sm"
              className="mt-4 w-full"
            >
              Lihat semua aktivitas
            </ButtonLink>
          </section>

          <section className="card p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gold-600" /> Aksi cepat
                </span>
              }
            />
            <div className="mt-3 grid gap-2">
              <ButtonLink href="/admin/users" variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-3.5 w-3.5" /> Kelola pengguna
              </ButtonLink>
              <ButtonLink href="/admin/organizers" variant="outline" size="sm" className="w-full justify-start">
                <BadgeCheck className="h-3.5 w-3.5" /> Verifikasi organizer
              </ButtonLink>
              <ButtonLink href="/admin/payouts" variant="outline" size="sm" className="w-full justify-start">
                <Wallet className="h-3.5 w-3.5" /> Proses pencairan dana
              </ButtonLink>
              <ButtonLink href="/admin/settings" variant="outline" size="sm" className="w-full justify-start">
                <ShieldCheck className="h-3.5 w-3.5" /> Atur kebijakan platform
              </ButtonLink>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
