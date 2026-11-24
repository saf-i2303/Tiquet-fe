"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Plus,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { QuickLinksCard } from "@/components/shared/quick-links-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { eventStatusMeta, orderStatusMeta, organizerStatusMeta } from "@/lib/constants";
import { requireOrganizerId } from "@/lib/ownership";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  getOrganizer,
  getOrganizerEvents,
  getOrganizerRevenueByEvent,
  getOrganizerStats,
  getOrganizerTransactions,
} from "@/services/organizerServices";
import type { EventWithStats } from "@/types/event";
import type { Order } from "@/types/order";
import type { Organizer } from "@/types/organizer";

export default function OrganizerDashboardPage() {
  const { user, isLoading } = useAuth();
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOrganizerStats>> | null>(null);
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [revenueByEvent, setRevenueByEvent] = useState<
    Awaited<ReturnType<typeof getOrganizerRevenueByEvent>>
  >([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    Promise.all([
      getOrganizer(organizerId),
      getOrganizerStats(organizerId),
      getOrganizerEvents(organizerId),
      getOrganizerTransactions(organizerId),
      getOrganizerRevenueByEvent(organizerId),
    ])
      .then(([profile, summary, eventList, orderList, revenue]) => {
        if (!active) return;
        setOrganizer(profile);
        setStats(summary);
        setEvents(eventList);
        setTransactions(orderList);
        setRevenueByEvent(revenue);
      })
      .catch(() => {
        if (!active) return;
        setOrganizer(undefined);
        setStats(null);
        setEvents([]);
        setTransactions([]);
        setRevenueByEvent([]);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user || isDataLoading || !stats) return null;

  const maxRevenue = Math.max(1, ...revenueByEvent.map((item) => item.revenue));

  return (
    <main>
      <PageHeader
        kicker="Organizer"
        title={`Halo, ${user.name.split(" ")[0]}!`}
        subtitle="Pantau penjualan, event, dan pencairan dana dari satu tempat."
        action={
          <ButtonLink href="/organizer/events/new" size="sm">
            <Plus className="h-4 w-4" /> Buat event
          </ButtonLink>
        }
      />

      {organizer && organizer.status !== "verified" && (
        <Alert tone="warning" className="mb-6">
          Status organizer kamu:{" "}
          <StatusBadge value={organizer.status} map={organizerStatusMeta} />. Lengkapi
          verifikasi agar event bisa tayang.{" "}
          <Link href="/organizer/verification" className="font-semibold underline">
            Cek verifikasi
          </Link>
        </Alert>
      )}

      <div className="stat-grid">
        <StatTile
          label="Total pendapatan"
          value={<Price value={stats.revenue} />}
          hint="Dari order lunas"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Tiket terjual"
          value={stats.ticketsSold.toLocaleString("id-ID")}
          hint={`${stats.transactions} transaksi`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Event aktif"
          value={stats.activeEvents}
          hint={`${stats.totalEvents} total event`}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Rata-rata order"
          value={<Price value={stats.avgOrderValue} />}
          hint="Per transaksi lunas"
          icon={<Wallet className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <CardHeader
            title="Pendapatan per event"
            action={
              <ButtonLink href="/organizer/reports" variant="ghost" size="sm">
                Laporan lengkap
              </ButtonLink>
            }
          />
          <div className="mt-4 space-y-4">
            {revenueByEvent.length === 0 ? (
              <EmptyState
                title="Belum ada data penjualan"
                description="Laporan akan terisi setelah ada order lunas untuk event kamu."
              />
            ) : (
              revenueByEvent.slice(0, 5).map((item) => (
                <div key={item.eventId}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-navy-900">{item.title}</span>
                    <Price value={item.revenue} className="shrink-0 text-xs" />
                  </div>
                  <div className="mt-1">
                    <Progress value={item.revenue} total={maxRevenue} showLabel={false} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted">{item.tickets} tiket terjual</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <aside className="section-stack">
          <QuickLinksCard
            items={[
              {
                href: "/organizer/events/new",
                label: "Buat event baru",
                icon: <Plus className="h-3.5 w-3.5" />,
              },
              {
                href: "/organizer/verification",
                label: "Verifikasi organizer",
                icon: <BadgeCheck className="h-3.5 w-3.5" />,
              },
              {
                href: "/organizer/payouts",
                label: "Ajukan pencairan",
                icon: <Wallet className="h-3.5 w-3.5" />,
              },
            ]}
          />

          <Card className="p-5">
            <CardHeader title="Event terbaru" />
            <div className="mt-3 space-y-2">
              {events.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/organizer/events/${event.id}`}
                  className="block rounded-control border border-line p-2.5 transition hover:border-navy-900/25 hover:bg-canvas"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-navy-900">
                      {event.title}
                    </span>
                    <StatusBadge value={event.status} map={eventStatusMeta} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {formatDate(event.date, { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="p-5">
          <CardHeader
            title="Transaksi terbaru"
            action={
              <ButtonLink
                href="/organizer/transactions"
                variant="ghost"
                size="sm"
              >
                Lihat semua <ArrowRight className="h-3 w-3" />
              </ButtonLink>
            }
          />
        </div>
        <TableShell>
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface">
              <tr>
                <th className="th">Order</th>
                <th className="th">Event</th>
                <th className="th">Pembeli</th>
                <th className="th">Tanggal</th>
                <th className="th">Total</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((order) => (
                <tr key={order.id} className="table-row">
                  <td className="td font-mono text-xs">{order.id}</td>
                  <td className="td">
                    <div className="max-w-52 truncate">{order.eventTitle}</div>
                  </td>
                  <td className="td text-xs">{order.customerName}</td>
                  <td className="td text-xs text-muted">{formatDateTime(order.createdAt)}</td>
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
    </main>
  );
}
