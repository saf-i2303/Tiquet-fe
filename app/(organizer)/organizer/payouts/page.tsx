"use client";

import { use, useEffect, useState } from "react";
import { Banknote, Clock, Landmark, Wallet } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { PayoutRequestForm } from "@/components/organizer/payout-request-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { SummaryRow } from "@/components/ui/summary-row";
import { TableShell } from "@/components/ui/table-shell";
import { payoutStatusMeta } from "@/lib/constants";
import { requireOrganizerId } from "@/lib/ownership";
import { formatDate } from "@/lib/utils";
import {
  getOrganizer,
  getOrganizerPayouts,
} from "@/services/organizerServices";
import type { Organizer, OrganizerPayout } from "@/types/organizer";

export default function OrganizerPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string; error?: string }>;
}) {
  const { requested, error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [payouts, setPayouts] = useState<OrganizerPayout[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    Promise.all([getOrganizer(organizerId), getOrganizerPayouts(organizerId)])
      .then(([profile, payoutList]) => {
        if (!active) return;
        setOrganizer(profile);
        setPayouts(payoutList);
      })
      .catch(() => {
        if (!active) return;
        setOrganizer(undefined);
        setPayouts([]);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user || isDataLoading) return null;

  if (!organizer) {
    return <Alert tone="danger">Data organizer tidak ditemukan.</Alert>;
  }

  const settled = payouts
    .filter((payout) => payout.status === "paid" || payout.status === "processing")
    .reduce((total, payout) => total + payout.amount, 0);
  const available = Math.max(0, organizer.revenue - settled);
  const pendingAmount = payouts
    .filter((payout) => payout.status === "pending")
    .reduce((total, payout) => total + payout.amount, 0);
  const totalPaid = payouts
    .filter((payout) => payout.status === "paid")
    .reduce((total, payout) => total + payout.net, 0);

  const sorted = [...payouts].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return (
    <main>
      <PageHeader
        kicker="Keuangan"
        title="Pencairan dana"
        subtitle="Ajukan pencairan pendapatan event dan pantau status transfernya."
      />

      {requested && (
        <Alert tone="success" className="mb-5">
          Pengajuan pencairan berhasil dikirim. Tim keuangan memproses maksimal 3 hari kerja.
        </Alert>
      )}
      {error === "amount" && (
        <Alert tone="danger" className="mb-5">
          Nominal pencairan harus lebih dari 0.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Saldo tersedia"
          value={<Price value={available} />}
          hint="Siap diajukan pencairan"
          icon={<Wallet className="h-4 w-4" />}
          tone="green"
        />
        <StatTile
          label="Total pendapatan"
          value={<Price value={organizer.revenue} />}
          hint="Sejak bergabung"
          icon={<Banknote className="h-4 w-4" />}
        />
        <StatTile
          label="Sedang diproses"
          value={<Price value={pendingAmount} />}
          hint="Menunggu approval"
          icon={<Clock className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Sudah dicairkan"
          value={<Price value={totalPaid} />}
          hint="Setelah biaya 3%"
          icon={<Landmark className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-stack">
          <PayoutRequestForm available={available} />

          <Card className="overflow-hidden">
            <div className="p-5">
              <CardHeader
                title="Riwayat pencairan"
                action={<span className="text-xs text-muted">{payouts.length} pengajuan</span>}
              />
            </div>

            {sorted.length === 0 ? (
              <div className="p-5 pt-0">
                <EmptyState
                  icon={<Wallet className="h-6 w-6" />}
                  title="Belum ada pencairan"
                  description="Pengajuan pertama bisa dilakukan setelah event pertama kamu selesai."
                />
              </div>
            ) : (
              <TableShell>
                <table className="w-full min-w-[760px]">
                  <thead className="bg-surface">
                    <tr>
                      <th className="th">ID</th>
                      <th className="th">Periode</th>
                      <th className="th">Nominal</th>
                      <th className="th">Biaya</th>
                      <th className="th">Diterima</th>
                      <th className="th">Status</th>
                      <th className="th">Diajukan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((payout) => (
                      <tr key={payout.id} className="table-row">
                        <td className="td font-mono text-xs">{payout.id}</td>
                        <td className="td text-sm">{payout.period}</td>
                        <td className="td">
                          <Price value={payout.amount} />
                        </td>
                        <td className="td text-xs text-muted">
                          -<Price value={payout.fee} className="text-xs" />
                        </td>
                        <td className="td">
                          <Price value={payout.net} />
                        </td>
                        <td className="td">
                          <StatusBadge value={payout.status} map={payoutStatusMeta} />
                        </td>
                        <td className="td text-xs text-muted">
                          {formatDate(payout.requestedAt, { dateStyle: "medium" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Card>
        </div>

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-navy-600" /> Rekening penerima
                </span>
              }
            />
            <div className="mt-3 space-y-2 rounded-control border border-line bg-canvas p-4">
              <SummaryRow label="Bank">BCA</SummaryRow>
              <SummaryRow label="Nomor rekening" className="font-mono">
                •••• •••• 4821
              </SummaryRow>
              <SummaryRow label="Atas nama">{organizer.ownerName}</SummaryRow>
            </div>
            <p className="body-copy mt-3 text-xs text-muted">
              Ubah rekening melalui tim support dengan melampirkan dokumen kepemilikan rekening.
            </p>
          </Card>

          <Card className="p-5">
            <CardHeader title="Ketentuan pencairan" />
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li>Minimal pencairan Rp100.000.</li>
              <li>Biaya transfer platform 3% dari nominal.</li>
              <li>Diproses maksimal 3 hari kerja setelah disetujui.</li>
              <li>Dana hanya bisa dicairkan dari event yang sudah berjalan.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
