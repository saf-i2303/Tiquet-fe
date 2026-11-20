"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ShieldCheck, Ticket } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { createOrderAction } from "@/lib/actions/order.action";
import type { TicketType } from "@/types/event";

export function TicketSelector({
  eventId,
  ticketTypes,
  defaultPhone,
  error,
}: {
  eventId: string;
  ticketTypes: TicketType[];
  defaultPhone?: string;
  error?: string;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const selected = useMemo(
    () => ticketTypes.filter((ticket) => (quantities[ticket.id] ?? 0) > 0),
    [quantities, ticketTypes],
  );
  const count = selected.reduce((total, ticket) => total + (quantities[ticket.id] ?? 0), 0);
  const subtotal = selected.reduce(
    (total, ticket) => total + ticket.price * (quantities[ticket.id] ?? 0),
    0,
  );

  return (
    <form action={createOrderAction} className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <input type="hidden" name="eventId" value={eventId} />

      <div className="space-y-4">
        {error && (
          <Alert tone={error === "empty" ? "warning" : "danger"}>
            {error === "empty"
              ? "Pilih minimal satu tiket sebelum lanjut."
              : "Tiket yang kamu pilih tidak tersedia. Coba jumlah lain."}
          </Alert>
        )}

        {ticketTypes.map((ticket) => {
          const remaining = Math.max(0, ticket.quota - ticket.sold);
          const max = Math.min(remaining, ticket.maxPerOrder);
          const value = quantities[ticket.id] ?? 0;
          const soldOut = remaining <= 0;

          return (
            <div key={ticket.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="type-subhead text-navy-900">{ticket.name}</h3>
                    <Badge tone={soldOut ? "red" : "green"}>
                      {soldOut ? "Habis" : `Sisa ${remaining}`}
                    </Badge>
                  </div>
                  <p className="body-copy mt-1 max-w-lg text-muted">{ticket.description}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-800">
                    {ticket.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 shrink-0 text-gold-600" strokeWidth={2.5} aria-hidden />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-xs text-muted">Harga / tiket</div>
                    <Price value={ticket.price} className="text-lg" />
                  </div>
                  <QuantityStepper
                    value={value}
                    onChange={(next) =>
                      setQuantities((prev) => ({ ...prev, [ticket.id]: next }))
                    }
                    max={max}
                    disabled={soldOut}
                    ariaLabel={`Jumlah tiket ${ticket.name}`}
                  />
                  {!soldOut && (
                    <div className="text-xs text-muted">Maks. {ticket.maxPerOrder} per transaksi</div>
                  )}
                </div>
              </div>

              {selected.some((item) => item.id === ticket.id) && (
                <>
                  <input type="hidden" name="ticketTypeId" value={ticket.id} />
                  <input type="hidden" name="qty" value={value} />
                </>
              )}
            </div>
          );
        })}
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="type-subhead flex items-center gap-2 text-navy-900">
          <Ticket className="h-4 w-4 text-gold-600" aria-hidden /> Ringkasan
        </h2>

        <div className="mt-4">
          {selected.length === 0 ? (
            <EmptyState
              title="Belum ada tiket dipilih"
              description="Pilih tiket di daftar untuk melanjutkan."
              className="px-4 py-6"
            />
          ) : (
            <div className="space-y-2 text-sm">
              {selected.map((ticket) => (
                <div key={ticket.id} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {ticket.name} × {quantities[ticket.id]}
                  </span>
                  <Price
                    value={ticket.price * (quantities[ticket.id] ?? 0)}
                    className="shrink-0 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="label" htmlFor="phone">
            Nomor WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultPhone}
            placeholder="08xxxxxxxxxx"
            className="input"
          />
        </div>

        <div className="my-5 border-t border-dashed border-line" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-2 text-muted">
            <span>Total tiket</span>
            <span className="font-semibold text-navy-900">{count}</span>
          </div>
          <div className="flex justify-between gap-2 text-muted">
            <span>Subtotal</span>
            <Price value={subtotal} className="text-sm" />
          </div>
        </div>

        <Button type="submit" disabled={count === 0} className="mt-5 w-full">
          Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="mt-3 flex items-start gap-2 text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
          Biaya layanan dan total akhir dihitung di halaman checkout.
        </p>
      </aside>
    </form>
  );
}
