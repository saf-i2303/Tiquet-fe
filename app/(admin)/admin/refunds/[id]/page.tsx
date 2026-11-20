import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { RefundStatusBadge } from "@/components/admin/refund-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { Price } from "@/components/ui/price";
import { SummaryRow } from "@/components/ui/summary-row";
import { routes } from "@/config/routes";
import { updateRefundStatusAction } from "@/lib/actions/refund.action";
import { requireRole } from "@/lib/guards";
import { formatDateTime } from "@/lib/utils";
import { getRefundById } from "@/services/refund.service";

export const metadata: Metadata = {
  title: "Detail Refund",
};

/** Stub halaman detail refund — dipakai Super Admin untuk memutuskan pengajuan. */
export default async function AdminRefundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("super_admin", "/admin/refunds");
  const { id } = await params;
  const refund = await getRefundById(id);
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
              <form action={updateRefundStatusAction}>
                <input type="hidden" name="refundId" value={refund.id} />
                <input type="hidden" name="status" value="refunded" />
                <Button size="sm">
                  <Check className="h-3.5 w-3.5" /> Setujui &amp; cairkan
                </Button>
              </form>
              <form action={updateRefundStatusAction}>
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
