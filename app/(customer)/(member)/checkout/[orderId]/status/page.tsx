"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CircleCheck, CircleX, Clock, Landmark, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { TicketCard } from "@/components/ticket/ticket-card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SummaryRow } from "@/components/ui/summary-row";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserFromStorage } from "@/lib/api";
import { orderStatusMeta } from "@/lib/constants";
import { requireOwnedOrder } from "@/lib/ownership";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { formatDateTime, formatRupiah } from "@/lib/utils";
import { getOrderById } from "@/services/order.service";
import { getPaymentMethods } from "@/services/payment.service";
import { getTicketsForOrder } from "@/services/ticketServices";
import type { Order } from "@/types/order";
import type { PaymentMethod } from "@/types/payment";
import type { Ticket } from "@/types/ticket";

const stateByStatus = {
  paid: {
    title: "Pembayaran berhasil!",
    description: "E-ticket sudah diterbitkan dan bisa langsung kamu pakai.",
    icon: CircleCheck,
    tone: "text-success",
    alert: "success" as const,
  },
  pending: {
    title: "Menunggu pembayaran",
    description: "Selesaikan pembayaran agar tiket kamu diterbitkan.",
    icon: Clock,
    tone: "text-warning",
    alert: "warning" as const,
  },
  expired: {
    title: "Pembayaran kedaluwarsa",
    description: "Batas waktu pembayaran sudah habis. Silakan buat order baru.",
    icon: Clock,
    tone: "text-muted",
    alert: "warning" as const,
  },
  cancelled: {
    title: "Order dibatalkan",
    description: "Order ini sudah dibatalkan dan tiket tidak diterbitkan.",
    icon: CircleX,
    tone: "text-danger",
    alert: "danger" as const,
  },
};

export default function PaymentStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );

  const [foundOrder, setFoundOrder] = useState<Order | undefined>(undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;

    void (async () => {
      try {
        const orderData = await getOrderById(orderId);
        if (!active) return;
        setFoundOrder(orderData);

        const [ticketData, paymentMethods] = await Promise.all([
          orderData?.status === "paid"
            ? getTicketsForOrder(orderData.id)
            : Promise.resolve([] as Ticket[]),
          getPaymentMethods(),
        ]);
        if (!active) return;
        setTickets(ticketData);
        setMethods(paymentMethods);
        setErrorMsg("");
      } catch {
        if (active) setErrorMsg("Gagal memuat status pembayaran");
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
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <Alert tone="info">Memuat data...</Alert>
      </main>
    );
  }

  const order = requireOwnedOrder(foundOrder, session);

  const state = stateByStatus[order.status];
  const Icon = state.icon;
  const method = methods.find((item) => item.name === order.paymentMethod) ?? methods[0];
  const digits = order.id.replace(/\D/g, "").slice(-8).padStart(8, "0");
  const virtualAccount = `8808 ${digits.slice(0, 4)} ${digits.slice(4)}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      {errorMsg && (
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      <Card className="p-6 text-center">
        <Icon className={`mx-auto h-9 w-9 ${state.tone}`} strokeWidth={1.5} />
        <h1 className="type-page mt-3 text-navy-900">{state.title}</h1>
        <p className="mt-1 text-sm text-muted">{state.description}</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge value={order.status} map={orderStatusMeta} />
        </div>

        <div className="mx-auto mt-5 max-w-sm rounded-control bg-canvas p-4 text-left">
          <SummaryRow label="Order ID">
            <span className="font-mono">{order.id}</span>
          </SummaryRow>
          <SummaryRow label="Total" className="mt-1">
            {formatRupiah(order.total)}
          </SummaryRow>
          <SummaryRow label="Metode" className="mt-1">
            {order.paymentMethod ?? "Belum dipilih"}
          </SummaryRow>
          {order.paidAt && (
            <SummaryRow label="Dibayar" className="mt-1">
              {formatDateTime(order.paidAt)}
            </SummaryRow>
          )}
        </div>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {order.status === "pending" ? (
            <ButtonLink href={`/checkout/${order.id}`} size="sm">
              Lanjutkan pembayaran
            </ButtonLink>
          ) : order.status === "paid" ? (
            <ButtonLink href="/tickets" size="sm">
              Buka tiket saya
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
      </Card>

      <Card className="mt-4 p-5">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              {order.status === "paid" ? (
                <Receipt className="h-4 w-4 text-gold-600" />
              ) : (
                <Landmark className="h-4 w-4 text-gold-600" />
              )}
              {order.status === "paid" ? "Bukti pembayaran" : "Instruksi pembayaran"}
            </span>
          }
        />

        {order.status === "paid" ? (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-muted">Nomor referensi</dt>
              <dd className="truncate font-mono font-semibold text-navy-900">
                PAY-{order.id.replace(/\D/g, "")}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Metode</dt>
              <dd className="truncate font-semibold text-navy-900">
                {order.paymentMethod ?? method?.name ?? "BCA Virtual Account"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Nominal</dt>
              <dd className="font-semibold text-navy-900">{formatRupiah(order.total)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Dibayar pada</dt>
              <dd className="font-semibold text-navy-900">
                {order.paidAt ? formatDateTime(order.paidAt) : "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-control bg-canvas p-4">
              <div className="text-xs text-muted">Metode pembayaran</div>
              <div className="font-semibold text-navy-900">
                {order.paymentMethod ?? method?.name ?? "BCA Virtual Account"}
              </div>
              <div className="mt-3 text-xs text-muted">Nomor Virtual Account</div>
              <div className="break-all font-mono text-lg font-semibold tracking-wide text-navy-900">
                {virtualAccount}
              </div>
              <div className="mt-3 text-xs text-muted">Nominal</div>
              <div className="font-semibold text-navy-900">{formatRupiah(order.total)}</div>
            </div>
            {method && method.instructions.length > 0 && (
              <ol className="space-y-1.5 text-sm text-navy-800">
                {method.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-gold-400">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </Card>

      {order.status === "paid" && tickets.length > 0 && (
        <section className="mt-6">
          <SectionHeading title="E-ticket kamu" className="mb-3" />
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </section>
      )}

      {order.status === "pending" && (
        <Alert tone={state.alert} className="mt-4">
          Order masih menunggu pembayaran sampai {formatDateTime(order.expiresAt)}.
        </Alert>
      )}
    </main>
  );
}
