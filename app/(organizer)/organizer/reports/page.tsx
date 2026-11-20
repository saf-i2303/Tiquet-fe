import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Receipt, Ticket, TrendingUp, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { categoryMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatRupiah, sum } from "@/lib/utils";
import {
  getOrganizerEvents,
  getOrganizerRevenueByEvent,
  getOrganizerStats,
  getOrganizerTransactions,
} from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Laporan Penjualan",
};

const monthLabel = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(iso));

export default async function OrganizerReportsPage() {
  const session = await requireRole("organizer", "/organizer/reports");
  const organizerId = session.organizerId ?? "org-001";

  const [stats, events, revenueByEvent, transactions] = await Promise.all([
    getOrganizerStats(organizerId),
    getOrganizerEvents(organizerId),
    getOrganizerRevenueByEvent(organizerId),
    getOrganizerTransactions(organizerId),
  ]);

  const maxRevenue = Math.max(1, ...revenueByEvent.map((item) => item.revenue));
  const paidOrders = transactions.filter((order) => order.status === "paid");

  const monthly = new Map<string, { revenue: number; orders: number }>();
  for (const order of paidOrders) {
    const key = monthLabel(order.createdAt);
    const current = monthly.get(key) ?? { revenue: 0, orders: 0 };
    monthly.set(key, {
      revenue: current.revenue + order.total,
      orders: current.orders + 1,
    });
  }
  const monthlyRows = [...monthly.entries()].sort(
    (a, b) => new Date(`1 ${b[0]}`).getTime() - new Date(`1 ${a[0]}`).getTime(),
  );
  const maxMonthly = Math.max(1, ...monthlyRows.map(([, value]) => value.revenue));

  const categoryRows = Object.keys(categoryMeta)
    .map((category) => {
      const matched = events.filter((event) => event.category === category);
      const revenue = revenueByEvent
        .filter((item) => matched.some((event) => event.id === item.eventId))
        .reduce((total, item) => total + item.revenue, 0);
      const tickets = revenueByEvent
        .filter((item) => matched.some((event) => event.id === item.eventId))
        .reduce((total, item) => total + item.tickets, 0);
      return { category, events: matched.length, revenue, tickets };
    })
    .filter((row) => row.events > 0);

  return (
    <main>
      <PageHeader
        kicker="Analitik"
        title="Laporan penjualan"
        subtitle="Ringkasan performa penjualan tiket dari seluruh event kamu."
        action={
          <ButtonLink href="/organizer/transactions" variant="outline" size="sm">
            <Receipt className="h-3.5 w-3.5" /> Lihat transaksi
          </ButtonLink>
        }
      />

      <div className="stat-grid mb-6">
        <StatTile
          label="Total pendapatan"
          value={formatRupiah(stats.revenue)}
          hint="Dari order lunas"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Tiket terjual"
          value={stats.ticketsSold.toLocaleString("id-ID")}
          hint={`${stats.totalEvents} event`}
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatTile
          label="Transaksi lunas"
          value={paidOrders.length}
          hint={`${stats.transactions} total transaksi`}
          icon={<Receipt className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Rata-rata order"
          value={formatRupiah(stats.avgOrderValue)}
          hint="Per transaksi lunas"
          icon={<Wallet className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      {revenueByEvent.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Belum ada data penjualan"
            description="Laporan akan terisi otomatis setelah ada order lunas untuk event kamu."
            action={
              <ButtonLink href="/organizer/events/new" size="sm">
                Buat event
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-6 p-5">
            <CardHeader
              title="Pendapatan per event"
              description={
                <>
                  Total{" "}
                  <Price value={sum(revenueByEvent.map((item) => item.revenue))} /> dari{" "}
                  {revenueByEvent.length} event.
                </>
              }
            />
            <div className="mt-4 space-y-4">
              {revenueByEvent.map((item) => (
                <div key={item.eventId}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      href={`/organizer/events/${item.eventId}`}
                      className="truncate font-semibold text-navy-900 hover:text-navy-700"
                    >
                      {item.title}
                    </Link>
                    <Price value={item.revenue} />
                  </div>
                  <div className="mt-1">
                    <Progress value={item.revenue} total={maxRevenue} showLabel={false} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {item.tickets.toLocaleString("id-ID")} tiket terjual
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <CardHeader title="Pendapatan per bulan" />
              {monthlyRows.length === 0 ? (
                <EmptyState className="mt-4" title="Belum ada transaksi lunas" />
              ) : (
                <div className="mt-4 space-y-3">
                  {monthlyRows.map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-navy-900">{label}</span>
                        <Price value={value.revenue} className="text-xs" />
                      </div>
                      <div className="mt-1">
                        <Progress value={value.revenue} total={maxMonthly} showLabel={false} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {value.orders} transaksi
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <CardHeader title="Performa per kategori" />
              <div className="mt-3">
                <TableShell>
                  <table className="w-full">
                    <thead className="bg-surface">
                      <tr>
                        <th className="th">Kategori</th>
                        <th className="th text-right">Event</th>
                        <th className="th text-right">Tiket</th>
                        <th className="th text-right">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryRows.map((row) => (
                        <tr key={row.category} className="table-row">
                          <td className="td text-sm font-semibold">
                            {categoryMeta[row.category as keyof typeof categoryMeta]?.label ??
                              row.category}
                          </td>
                          <td className="td text-right text-sm">{row.events}</td>
                          <td className="td text-right text-sm">
                            {row.tickets.toLocaleString("id-ID")}
                          </td>
                          <td className="td text-right text-sm">
                            <Price value={row.revenue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              </div>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
