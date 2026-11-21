"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { RefundStatusBadge } from "@/components/admin/refund-status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { Price } from "@/components/ui/price";
import { SummaryRow } from "@/components/ui/summary-row";
import { routes } from "@/config/routes";
import { formatDateTime } from "@/lib/utils";
import { getRefundById } from "@/services/refund.service";

/** Stub halaman detail refund — dipakai Super Admin untuk memutuskan pengajuan. */
export default function AdminRefundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [refund, setRefund] = useState<Awaited<ReturnType<typeof getRefundById>>>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    getRefundById(id)
      .then((data) => {
        if (!active) return;
        setRefund(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setRefund(undefined);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main>
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      </main>
    );
  }
  if (errorMsg) {
    return (
      <main>
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      </main>
    );
  }
  if (!refund) notFound();

  return (
    <main>
      <DetailHeader
        backHref={routes.admin.refunds}
        backLabel="Kembali ke daftar refund"
        title={`Refund ${refund.id}`}
        subtitle={`Order ${refund.orderId} · diajukan ${formatDateTime(refund.requestedAt)}`}
        badge={<RefundStatusBadge status={refund.status} />}
        actions={
          refund.status === "requested" || refund.status === "approved" ? (
            <div className="flex flex-wrap gap-2">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  alert("Fitur belum tersedia");
                }}
              >
                <input type="hidden" name="refundId" value={refund.id} />
                <input type="hidden" name="status" value="refunded" />
                <Button size="sm">
                  <Check className="h-3.5 w-3.5" /> Setujui &amp; cairkan
                </Button>
              </form>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  alert("Fitur belum tersedia");
                }}
              >
                <input type="hidden" name="refundId" value={refund.id} />
                <input type="hidden" name="status" value="rejected" />
                <Button variant="outline" size="sm">
                  <X className="h-3.5 w-3.5" /> Tolak
                </Button>
              </form>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <CardHeader
            title="Informasi pengajuan"
            description="Data refund ini masih berupa fixture development."
          />
          <div className="mt-4 space-y-2">
            <SummaryRow label="Nominal refund">
              <Price value={refund.amount} />
            </SummaryRow>
            <SummaryRow label="Customer">{refund.customerName}</SummaryRow>
            <SummaryRow label="ID customer">
              <span className="font-mono text-xs">{refund.customerId}</span>
            </SummaryRow>
            <SummaryRow label="Organizer">
              {refund.organizerName ?? "Tidak tercantum"}
            </SummaryRow>
            <SummaryRow label="Alasan">{refund.reason}</SummaryRow>
            <SummaryRow label="Diajukan">{formatDateTime(refund.requestedAt)}</SummaryRow>
            {refund.resolvedAt && (
              <SummaryRow label="Diselesaikan">{formatDateTime(refund.resolvedAt)}</SummaryRow>
            )}
          </div>
        </Card>

        <aside className="h-fit space-y-4">
          <Card className="p-5">
            <CardHeader title="Ringkasan" />
            <div className="mt-3 space-y-2">
              <SummaryRow label="Status">
                <RefundStatusBadge status={refund.status} />
              </SummaryRow>
              <SummaryRow label="Order">
                <span className="font-mono text-xs">{refund.orderId}</span>
              </SummaryRow>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Catatan integrasi"
              description="Keputusan refund wajib divalidasi ulang oleh backend."
            />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Setelah kontrak API /admin/refunds disepakati, ganti service stub dengan
              pemanggilan API dan pastikan setiap perubahan status tercatat di audit log.
            </p>
          </Card>
        </aside>
      </div>
    </main>
  );
}
