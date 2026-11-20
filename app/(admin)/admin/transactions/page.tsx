import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Ticket, TrendingUp, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { orderStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatDateTime, formatRupiah } from "@/lib/utils";
import { getAllOrders } from "@/services/admin.service";

export const metadata: Metadata = {
  title: "Transaksi Platform",
};

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "paid", label: "Lunas" },
  { value: "pending", label: "Menunggu" },
  { value: "expired", label: "Kedaluwarsa" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("super_admin", "/admin/transactions");
  const { status = "", q = "" } = await searchParams;
  const orders = await getAllOrders();

  const needle = q.trim().toLowerCase();
  const filtered = orders.filter((order) => {
    const matchStatus = !status || order.status === status;
    const matchQuery =
      !needle ||
      order.id.toLowerCase().includes(needle) ||
      order.eventTitle.toLowerCase().includes(needle) ||
      order.customerName.toLowerCase().includes(needle) ||
      order.customerEmail.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const paid = orders.filter((order) => order.status === "paid");
  const gmv = paid.reduce((total, order) => total + order.total, 0);
  const tickets = paid.reduce(
    (total, order) => total + order.items.reduce((count, item) => count + item.qty, 0),
    0,
  );
  const pending = orders.filter((order) => order.status === "pending").length;

  return (
    <main>
      <PageHeader
        kicker="Keuangan platform"
        title="Transaksi"
        subtitle="Pantau seluruh transaksi lintas organizer dan status pembayarannya."
      />

      <div className="stat-grid mb-6">
        <StatTile
          label="GMV lunas"
          value={formatRupiah(gmv)}
          hint="Dari order lunas"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Total transaksi"
          value={orders.length}
          hint="Semua status"
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatTile
          label="Tiket terjual"
          value={tickets.toLocaleString("id-ID")}
          hint="Dari order lunas"
          icon={<Ticket className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Menunggu bayar"
          value={pending}
          hint="Order pending"
          icon={<Wallet className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={statusFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/transactions${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Order, event, pembeli..."
        defaultValue={q}
        hidden={{ status }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Transaksi tidak ditemukan"
          description="Coba ubah filter status atau kata kunci pencarian."
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[900px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">Order</th>
                  <th className="th">Event</th>
                  <th className="th">Pembeli</th>
                  <th className="th">Metode</th>
                  <th className="th">Tanggal</th>
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
                        href={`/admin/events/${order.eventId}`}
                        className="block max-w-56 truncate font-semibold text-navy-900 hover:text-navy-700"
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
                    <td className="td text-xs text-muted">{order.paymentMethod ?? "—"}</td>
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
      )}
    </main>
  );
}
