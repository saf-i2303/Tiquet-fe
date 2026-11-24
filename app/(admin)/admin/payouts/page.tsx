"use client";

import { use, useEffect, useState } from "react";
import { ArrowRight, Banknote, Clock, Landmark, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { payoutStatusFilters, payoutStatusMeta } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getPayoutsList } from "@/services/adminServices";

export default function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string }>;
}) {
  const { status = "", saved } = use(searchParams);
  const [payouts, setPayouts] = useState<Awaited<ReturnType<typeof getPayoutsList>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    getPayoutsList()
      .then((data) => {
        if (!active) return;
        setPayouts(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setPayouts([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = status ? payouts.filter((payout) => payout.status === status) : payouts;
  const pending = payouts.filter((payout) => payout.status === "pending");
  const processing = payouts.filter((payout) => payout.status === "processing");
  const paid = payouts.filter((payout) => payout.status === "paid");
  const paidAmount = paid.reduce((total, payout) => total + payout.net, 0);

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
        title="Pencairan dana"
        subtitle="Tinjau pengajuan pencairan dari organizer dan tandai transfer yang sudah selesai."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Status pencairan berhasil diperbarui.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total pengajuan"
          value={payouts.length}
          hint="Semua status"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatTile
          label="Menunggu"
          value={pending.length}
          hint="Belum diproses"
          icon={<Clock className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Diproses"
          value={processing.length}
          hint="Sedang ditransfer"
          icon={<Banknote className="h-4 w-4" />}
          tone="blue"
        />
        <StatTile
          label="Sudah cair"
          value={<Price value={paidAmount} />}
          hint={`${paid.length} pencairan selesai`}
          icon={<Landmark className="h-4 w-4" />}
          tone="green"
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={payoutStatusFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/payouts${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        showSearch={false}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title="Belum ada pengajuan pencairan"
          description="Pengajuan dari organizer akan muncul di sini untuk ditinjau."
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[900px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">ID</th>
                  <th className="th">Organizer</th>
                  <th className="th">Periode</th>
                  <th className="th">Nominal</th>
                  <th className="th">Diterima</th>
                  <th className="th">Status</th>
                  <th className="th">Diajukan</th>
                  <th className="th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payout) => (
                  <tr key={payout.id} className="table-row">
                    <td className="td font-mono text-xs">{payout.id}</td>
                    <td className="td">
                      <div className="text-sm font-semibold text-navy-900">
                        {payout.organizerName}
                      </div>
                      <div className="font-mono text-xs text-muted">{payout.organizerId}</div>
                    </td>
                    <td className="td text-sm">{payout.period}</td>
                    <td className="td">
                      <Price value={payout.amount} />
                    </td>
                    <td className="td">
                      <Price value={payout.net} />
                    </td>
                    <td className="td">
                      <StatusBadge value={payout.status} map={payoutStatusMeta} />
                      {payout.paidAt && (
                        <div className="mt-1 text-xs text-muted">
                          {formatDate(payout.paidAt, { dateStyle: "medium" })}
                        </div>
                      )}
                    </td>
                    <td className="td text-xs text-muted">
                      {formatDateTime(payout.requestedAt)}
                    </td>
                    <td className="td">
                      {payout.status === "pending" && (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            alert("Fitur belum tersedia");
                          }}
                        >
                          <input type="hidden" name="payoutId" value={payout.id} />
                          <input type="hidden" name="status" value="processing" />
                          <Button variant="outline" size="sm">
                            Proses <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      )}
                      {payout.status === "processing" && (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            alert("Fitur belum tersedia");
                          }}
                        >
                          <input type="hidden" name="payoutId" value={payout.id} />
                          <input type="hidden" name="status" value="paid" />
                          <Button size="sm">Tandai cair</Button>
                        </form>
                      )}
                      {payout.status === "paid" && (
                        <span className="text-xs text-muted">Selesai</span>
                      )}
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
