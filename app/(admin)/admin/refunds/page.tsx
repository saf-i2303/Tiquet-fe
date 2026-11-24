"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Clock, RotateCcw, XCircle } from "lucide-react";
import { RefundStatusBadge } from "@/components/admin/refund-status-badge";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { routes } from "@/config/routes";
import { refundStatusFilters } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { getRefundStats, getRefunds } from "@/services/refund.service";

/**
 * Stub halaman Refund Management (plan.md 4A Super Admin).
 * Data masih berasal dari fixture development; integrasi API menyusul.
 */
export default function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string }>;
}) {
  const { status = "", saved } = use(searchParams);
  const [refunds, setRefunds] = useState<Awaited<ReturnType<typeof getRefunds>>>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getRefundStats>>>({
    total: 0,
    requested: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getRefunds(), getRefundStats()])
      .then(([nextRefunds, nextStats]) => {
        if (!active) return;
        setRefunds(nextRefunds);
        setStats(nextStats);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setRefunds([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = status ? refunds.filter((refund) => refund.status === status) : refunds;

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
        kicker="Keuangan platform"
        title="Pengelolaan refund"
        subtitle="Tinjau pengajuan pengembalian dana dari customer dan tentukan keputusannya."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Status refund berhasil diperbarui.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total pengajuan"
          value={stats.total}
          hint="Semua status"
          icon={<RotateCcw className="h-4 w-4" />}
        />
        <StatTile
          label="Menunggu keputusan"
          value={stats.requested}
          hint="Perlu ditinjau"
          icon={<Clock className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Dalam proses"
          value={stats.inProgress}
          hint="Disetujui / diproses"
          icon={<RotateCcw className="h-4 w-4" />}
          tone="blue"
        />
        <StatTile
          label="Ditolak"
          value={stats.rejected}
          hint="Tidak memenuhi kebijakan"
          icon={<XCircle className="h-4 w-4" />}
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={refundStatusFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/refunds${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        showSearch={false}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="h-6 w-6" />}
          title="Belum ada pengajuan refund"
          description="Pengajuan refund dari customer akan muncul di sini untuk ditinjau."
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[900px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">ID</th>
                  <th className="th">Order</th>
                  <th className="th">Customer</th>
                  <th className="th">Nominal</th>
                  <th className="th">Status</th>
                  <th className="th">Diajukan</th>
                  <th className="th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((refund) => (
                  <tr key={refund.id} className="table-row">
                    <td className="td font-mono text-xs">{refund.id}</td>
                    <td className="td font-mono text-xs">{refund.orderId}</td>
                    <td className="td">
                      <div className="text-sm font-semibold text-navy-900">
                        {refund.customerName}
                      </div>
                      <div className="text-xs text-muted">
                        {refund.organizerName ?? "Organizer tidak tercantum"}
                      </div>
                    </td>
                    <td className="td">
                      <Price value={refund.amount} />
                    </td>
                    <td className="td">
                      <RefundStatusBadge status={refund.status} />
                    </td>
                    <td className="td text-xs text-muted">
                      {formatDateTime(refund.requestedAt)}
                    </td>
                    <td className="td">
                      <Link
                        href={routes.admin.refund(refund.id)}
                        className="text-sm font-semibold text-navy-700 hover:underline"
                      >
                        Detail
                      </Link>
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
