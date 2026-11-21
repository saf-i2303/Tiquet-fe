"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { requireOwnedOrder } from "@/lib/ownership";
import { CreditCard, QrCode, Receipt, Ticket as TicketIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { Price } from "@/components/ui/price";
import { SummaryRow } from "@/components/ui/summary-row";
import { getApiErrorMessage, getUserFromStorage } from "@/lib/api";
import { orderStatusMeta, ticketStatusMeta } from "@/lib/constants";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils";
import { cancelOrder, getOrderById } from "@/services/order.service";
import { getTicketsForOrder } from "@/services/ticketServices";
import type { Order } from "@/types/order";
import type { Ticket } from "@/types/ticket";

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );

  const [foundOrder, setFoundOrder] = useState<Order | undefined>(undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;

    void (async () => {
      try {
        const found = await getOrderById(orderId);
        if (!active) return;
        setFoundOrder(found);

        const ticketData = found ? await getTicketsForOrder(found.id) : [];
        if (!active) return;
        setTickets(ticketData);
        setErrorMsg("");
      } catch {
        if (active) setErrorMsg("Gagal memuat detail order");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, session]);

  async function handleCancel() {
    if (isCancelling) return;
    if (!window.confirm("Batalkan order ini? Kuota tiket akan dikembalikan.")) return;

    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      const updated = await getOrderById(orderId);
      if (updated) {
        setFoundOrder(updated);
        setTickets(await getTicketsForOrder(updated.id));
      }
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal membatalkan order"));
    } finally {
      setIsCancelling(false);
    }
  }

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
        title={order.id}
        badge={<StatusBadge value={order.status} map={orderStatusMeta} />}
        subtitle={`Dibuat ${formatDateTime(order.createdAt)} · ${order.items.length} jenis tiket`}
        actions={
          <>
            {order.status === "pending" && (
              <ButtonLink href={`/checkout/${order.id}`} size="sm">
                <CreditCard className="h-3.5 w-3.5" /> Bayar sekarang
              </ButtonLink>
            )}
            {order.status === "pending" && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Membatalkan..." : "Batalkan"}
              </Button>
            )}
            {order.status === "paid" && (
              <ButtonLink href="/tickets" size="sm">
                <TicketIcon className="h-3.5 w-3.5" /> Lihat tiket
              </ButtonLink>
            )}
          </>
        }
      />

      {order.status === "pending" && (
        <Alert tone="warning" className="mb-4">
          Selesaikan pembayaran sebelum {formatDateTime(order.expiresAt)} agar tiket tidak
          dilepas kembali.
        </Alert>
      )}
      {order.status === "expired" && (
        <Alert tone="danger" className="mb-4">
          Batas waktu pembayaran untuk order ini telah berakhir.
        </Alert>
      )}
      {order.status === "cancelled" && (
        <Alert tone="info" className="mb-4">
          Order ini telah dibatalkan.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gold-600" /> Detail event
                </span>
              }
            />
            <div className="mt-4 rounded-control border border-line bg-canvas p-4">
              <div className="font-semibold text-navy-900">{order.eventTitle}</div>
              <div className="mt-1 text-sm text-muted">
                {formatDate(order.eventDate, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-muted">{order.venue}</div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.ticketTypeId}
                  className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-navy-900">{item.ticketTypeName}</div>
                    <div className="text-xs text-muted">
                      {item.qty} × {formatRupiah(item.price)}
                    </div>
                  </div>
                  <Price value={item.subtotal} className="shrink-0" />
                </div>
              ))}
            </div>
          </Card>

          {tickets.length > 0 && (
            <Card className="p-5">
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-gold-600" /> E-ticket
                  </span>
                }
              />
              <div className="mt-4 space-y-2">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2 text-sm transition hover:border-navy-900/25 hover:bg-canvas"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy-900">
                        {ticket.ticketTypeName} · {ticket.holderName}
                      </div>
                      <div className="truncate font-mono text-xs text-muted">{ticket.id}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge value={ticket.status} map={ticketStatusMeta} />
                      <QrCode className="h-4 w-4 text-gold-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <CardHeader title="Informasi pemesan" />
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-xs text-muted">Nama</dt>
                <dd className="truncate font-semibold text-navy-900">{order.customerName}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted">Email</dt>
                <dd className="truncate font-semibold text-navy-900">{order.customerEmail}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted">WhatsApp</dt>
                <dd className="font-semibold text-navy-900">{order.customerPhone}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted">Metode pembayaran</dt>
                <dd className="truncate font-semibold text-navy-900">
                  {order.paymentMethod ?? "Belum dipilih"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <CardHeader title="Ringkasan pembayaran" />
          <div className="mt-4 space-y-2">
            <SummaryRow label="Subtotal">
              <Price value={order.subtotal} />
            </SummaryRow>
            <SummaryRow label="Biaya layanan">
              <Price value={order.serviceFee} />
            </SummaryRow>
            <div className="my-3 dashed-rule" />
            <SummaryRow label="Total" strong>
              <Price value={order.total} />
            </SummaryRow>
          </div>

          <dl className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Batas bayar</dt>
              <dd className="font-semibold text-navy-900">{formatDateTime(order.expiresAt)}</dd>
            </div>
            {order.paidAt && (
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Dibayar</dt>
                <dd className="font-semibold text-navy-900">{formatDateTime(order.paidAt)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </main>
  );
}
