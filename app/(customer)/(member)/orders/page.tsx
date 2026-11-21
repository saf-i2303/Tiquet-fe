"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ArrowRight, Receipt } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { getUserFromStorage } from "@/lib/api";
import { orderStatusMeta } from "@/lib/constants";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { formatDate, formatRupiah } from "@/lib/utils";
import { getOrdersByCustomer } from "@/services/order.service";
import type { Order } from "@/types/order";

const filters: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu pembayaran" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "expired", label: "Kedaluwarsa" },
];

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = use(searchParams);
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;

    getOrdersByCustomer(session.id)
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (active) setErrorMsg("Gagal memuat riwayat transaksi");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  const filtered = status ? orders.filter((order) => order.status === status) : orders;
  const paid = orders.filter((order) => order.status === "paid");
  const pending = orders.filter((order) => order.status === "pending");
  const spent = paid.reduce((total, order) => total + order.total, 0);

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
        kicker="Transaksi"
        title="Riwayat transaksi"
        subtitle="Pantau status pembayaran dan buka detail order kapan saja."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile label="Total transaksi" value={orders.length} hint="Semua order" />
        <StatTile
          label="Menunggu pembayaran"
          value={pending.length}
          hint="Segera selesaikan"
          tone="blue"
        />
        <StatTile
          label="Total belanja"
          value={formatRupiah(spent)}
          hint="Dari order lunas"
          tone="green"
        />
      </div>

      <FilterBar
        className="mb-4"
        showSearch={false}
        chips={filters.map((filter) => ({
          label: filter.label,
          href: filter.value ? `/orders?status=${filter.value}` : "/orders",
          active: status === filter.value || (!status && !filter.value),
        }))}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="Belum ada transaksi"
          description="Order yang kamu buat akan muncul di sini beserta status pembayarannya."
          action={<ButtonLink href="/events">Mulai cari tiket</ButtonLink>}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="overflow-hidden">
              <TableShell>
                <table className="w-full min-w-[720px]">
                  <thead className="bg-canvas">
                    <tr>
                      <th className="th">Order</th>
                      <th className="th">Event</th>
                      <th className="th">Tanggal</th>
                      <th className="th">Total</th>
                      <th className="th">Status</th>
                      <th className="th text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="td max-w-40 truncate font-mono text-xs">{order.id}</td>
                        <td className="td">
                          <div className="max-w-56 truncate font-semibold">{order.eventTitle}</div>
                          <div className="text-xs text-muted">
                            {order.items.reduce((total, item) => total + item.qty, 0)} tiket
                          </div>
                        </td>
                        <td className="td text-xs text-muted">{formatDate(order.createdAt)}</td>
                        <td className="td font-semibold">{formatRupiah(order.total)}</td>
                        <td className="td">
                          <StatusBadge value={order.status} map={orderStatusMeta} />
                        </td>
                        <td className="td text-right">
                          {order.status === "pending" ? (
                            <ButtonLink href={`/checkout/${order.id}`} size="sm">
                              Bayar <ArrowRight className="h-3.5 w-3.5" />
                            </ButtonLink>
                          ) : (
                            <ButtonLink href={`/orders/${order.id}`} variant="outline" size="sm">
                              Detail
                            </ButtonLink>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </Card>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs text-muted">{order.id}</div>
                    <div className="mt-1 truncate font-semibold text-navy-900">
                      {order.eventTitle}
                    </div>
                    <div className="text-xs text-muted">
                      {order.items.reduce((total, item) => total + item.qty, 0)} tiket
                    </div>
                  </div>
                  <StatusBadge value={order.status} map={orderStatusMeta} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                  <div>
                    <div className="text-xs text-muted">{formatDate(order.createdAt)}</div>
                    <span className="font-semibold text-navy-900">{formatRupiah(order.total)}</span>
                  </div>
                  {order.status === "pending" ? (
                    <ButtonLink href={`/checkout/${order.id}`} size="sm">
                      Bayar <ArrowRight className="h-3.5 w-3.5" />
                    </ButtonLink>
                  ) : (
                    <ButtonLink href={`/orders/${order.id}`} variant="outline" size="sm">
                      Detail
                    </ButtonLink>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
