import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Ticket, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { orderStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatDateTime } from "@/lib/utils";
import { getOrganizerTransactions } from "@/services/organizer.service";

export const metadata: Metadata = {
  title: "Transaksi",
};

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "paid", label: "Lunas" },
  { value: "pending", label: "Menunggu" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default async function OrganizerTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireRole("organizer", "/organizer/transactions");
  const { status = "", q = "" } = await searchParams;
  const organizerId = session.organizerId ?? "org-001";
  const transactions = await getOrganizerTransactions(organizerId);

  const needle = q.trim().toLowerCase();
  const filtered = transactions.filter((order) => {
    const matchStatus = !status || order.status === status;
    const matchQuery =
      !needle ||
      order.id.toLowerCase().includes(needle) ||
      order.eventTitle.toLowerCase().includes(needle) ||
      order.customerName.toLowerCase().includes(needle) ||
      order.customerEmail.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const paid = transactions.filter((order) => order.status === "paid");
  const revenue = paid.reduce((total, order) => total + order.total, 0);
  const tickets = paid.reduce(
    (total, order) => total + order.items.reduce((count, item) => count + item.qty, 0),
    0,
  );

  return (
    <main>
      <PageHeader
        kicker="Keuangan"
        title="Transaksi"
        subtitle="Semua order untuk event yang kamu selenggarakan, lengkap dengan status pembayarannya."
        action={
          <ButtonLink href="/organizer/reports" variant="outline" size="sm">
            <TrendingUp className="h-3.5 w-3.5" /> Laporan penjualan
          </ButtonLink>
        }
      />

      <div className="stat-grid mb-6">
        <StatTile
          label="Total transaksi"
          value={transactions.length}
          hint="Semua status"
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatTile
          label="Transaksi lunas"
          value={paid.length}
          hint="Pembayaran terverifikasi"
          tone="green"
        />
        <StatTile
          label="Tiket terjual"
          value={tickets.toLocaleString("id-ID")}
          hint="Dari order lunas"
          icon={<Ticket className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Pendapatan"
          value={<Price value={revenue} />}
          hint="Sebelum bagi hasil"
          tone="blue"
        />
      </div>

      <FilterBar
        chips={statusFilters.map((filter) => ({
          label: filter.label,
          href: `/organizer/transactions${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Order, event, pembeli..."
        defaultValue={q}
        hidden={{ status }}
        className="mb-5"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Transaksi tidak ditemukan"
          description="Coba ubah filter status atau kata kunci. Transaksi baru akan muncul otomatis."
          action={
            <ButtonLink href="/organizer/transactions" size="sm">
              Reset filter
            </ButtonLink>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[880px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">Order</th>
                  <th className="th">Event</th>
                  <th className="th">Pembeli</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Tiket</th>
                  <th className="th">Total</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="td font-mono text-xs">{order.id}</td>
                    <td className="td">
                      <Link
                        href={`/organizer/events/${order.eventId}`}
                        className="block max-w-52 truncate font-semibold text-navy-900 hover:text-navy-700"
                      >
                        {order.eventTitle}
                      </Link>
                    </td>
                    <td className="td">
                      <div className="text-sm font-semibold text-navy-900">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-muted">{order.customerEmail}</div>
                    </td>
                    <td className="td text-xs text-muted">{formatDateTime(order.createdAt)}</td>
                    <td className="td text-sm">
                      {order.items.reduce((total, item) => total + item.qty, 0)}
                    </td>
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
      )}
    </main>
  );
}
