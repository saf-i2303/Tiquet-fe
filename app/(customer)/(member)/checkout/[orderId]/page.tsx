"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { BenefitList } from "@/components/ui/benefit-list";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { DetailHeader } from "@/components/ui/detail-header";
import { Price } from "@/components/ui/price";
import { SummaryRow } from "@/components/ui/summary-row";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserFromStorage } from "@/lib/api";
import { orderStatusMeta } from "@/lib/constants";
import { requireOwnedOrder } from "@/lib/ownership";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils";
import { getOrderById, payOrder } from "@/services/order.service";
import { getPaymentMethods } from "@/services/payment.service";
import type { Order } from "@/types/order";
import type { PaymentMethod } from "@/types/payment";

const groupLabel: Record<string, string> = {
  bank: "Transfer bank / Virtual Account",
  ewallet: "E-Wallet",
  card: "Kartu kredit / debit",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );

  const [foundOrder, setFoundOrder] = useState<Order | undefined>(undefined);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;

    void (async () => {
      try {
        const [found, paymentMethods] = await Promise.all([
          getOrderById(orderId),
          getPaymentMethods(),
        ]);
        if (!active) return;
        setFoundOrder(found);
        setMethods(paymentMethods);
        setErrorMsg("");
      } catch {
        if (active) setErrorMsg("Gagal memuat data pembayaran");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, session]);

  if (isLoading || !session) {
    return (
      <main>
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      </main>
    );
  }

  const order = requireOwnedOrder(foundOrder, session);

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const methodName = formData.get("methodId")?.toString() ?? "";
    const result = await payOrder(order.id, methodName);

    if (!result) {
      alert("Fitur belum tersedia");
      return;
    }
    router.push(`/checkout/${order.id}/status`);
  }

  const groups = ["bank", "ewallet", "card"].filter((group) =>
    methods.some((method) => method.group === group),
  );
  const canPay = order.status === "pending";

  return (
    <main>
      {errorMsg && (
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      <DetailHeader
        backHref="/orders"
        backLabel="Kembali ke riwayat"
        title="Pembayaran"
        badge={<StatusBadge value={order.status} map={orderStatusMeta} />}
        subtitle={
          <>
            Order <span className="font-mono font-semibold text-navy-900">{order.id}</span> ·{" "}
            {order.eventTitle}
          </>
        }
        actions={canPay ? <Countdown target={order.expiresAt} /> : undefined}
      />

      {!canPay ? (
        <div className="space-y-4">
          <Alert tone={order.status === "paid" ? "success" : "warning"}>
            Order ini berstatus{" "}
            <b>{orderStatusMeta[order.status]?.label ?? order.status}</b>.{" "}
            {order.status === "paid"
              ? "Tiket sudah diterbitkan dan bisa kamu akses di menu Tiket Saya."
              : "Pembayaran tidak lagi bisa dilakukan untuk order ini."}
          </Alert>
          <div className="flex flex-wrap gap-2">
            {order.status === "paid" ? (
              <ButtonLink href="/tickets" size="sm">
                Lihat tiket saya
              </ButtonLink>
            ) : (
              <ButtonLink href="/events" size="sm">
                Cari event lain
              </ButtonLink>
            )}
            <ButtonLink href={`/orders/${order.id}`} variant="outline" size="sm">
              Detail order
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handlePay} className="space-y-4">
            <input type="hidden" name="orderId" value={order.id} />
            <Card className="p-5">
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gold-600" /> Pilih metode pembayaran
                  </span>
                }
              />

              <div className="mt-4 space-y-4">
                {groups.map((group) => (
                  <div key={group}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      {groupLabel[group]}
                    </div>
                    <div className="space-y-2">
                      {methods
                        .filter((method) => method.group === group)
                        .map((method) => (
                          <label
                            key={method.id}
                            className="flex cursor-pointer items-center gap-3 rounded-control border border-line p-3 transition hover:border-navy-900/30 has-checked:border-navy-900 has-checked:bg-canvas"
                          >
                            <input
                              type="radio"
                              name="methodId"
                              value={method.id}
                              defaultChecked={method.id === methods[0]?.id}
                              className="accent-navy-900"
                            />
                            <span className="flex-1 text-sm font-semibold text-navy-900">
                              {method.name}
                            </span>
                            <span className="text-xs text-muted">
                              {method.fee > 0 ? `+${formatRupiah(method.fee)}` : "Gratis"}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <CardHeader title="Instruksi pembayaran" />
              <p className="mt-3 text-sm text-muted">
                Instruksi lengkap muncul di halaman status setelah kamu menekan tombol bayar.
              </p>
              <BenefitList
                items={["Pembayaran diverifikasi otomatis", "Transaksi terenkripsi"]}
                className="mt-3"
              />
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Bayar Sekarang
            </Button>
            <p className="text-center text-xs text-muted">
              Dengan melanjutkan, kamu menyetujui syarat &amp; ketentuan TiketKu.
            </p>
          </form>

          <Card className="h-fit p-5 lg:sticky lg:top-24">
            <CardHeader title="Ringkasan order" />
            <div className="mt-4 rounded-control border border-line bg-canvas p-3">
              <div className="font-semibold text-navy-900">{order.eventTitle}</div>
              <div className="mt-0.5 text-xs text-muted">
                {formatDate(order.eventDate, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {order.venue}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <SummaryRow key={item.ticketTypeId} label={`${item.ticketTypeName} × ${item.qty}`}>
                  <Price value={item.subtotal} />
                </SummaryRow>
              ))}
              <SummaryRow label="Biaya layanan">
                <Price value={order.serviceFee} />
              </SummaryRow>
              <div className="my-3 dashed-rule" />
              <SummaryRow label="Total" strong>
                <Price value={order.total} />
              </SummaryRow>
            </div>

            <Alert tone="warning" className="mt-4">
              Bayar sebelum {formatDateTime(order.expiresAt)}. Setelah itu tiket otomatis dilepas.
            </Alert>
          </Card>
        </div>
      )}
    </main>
  );
}
