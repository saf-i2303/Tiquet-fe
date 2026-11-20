import { QrCode, Ticket as TicketIcon } from "lucide-react";
import { EventMeta } from "@/components/shared/event-meta";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { QrPlaceholder } from "@/components/ui/qr-placeholder";
import { ticketStatusMeta } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

/** Shared by the e-ticket view and the download/share summary. */
export const QR_CAUTION =
  "Tunjukkan QR ini ke gate staff saat check-in. QR hanya berlaku untuk satu kali scan.";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-900 px-5 py-3 text-white">
        <span className="eyebrow text-gold-300">
          {ticket.ticketTypeName}
        </span>
        <StatusBadge value={ticket.status} map={ticketStatusMeta} />
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <h3 className="type-subhead truncate text-navy-900">
            {ticket.eventTitle}
          </h3>
          <EventMeta
            date={ticket.eventDate}
            time={ticket.eventDate}
            venue={ticket.venue}
            city={ticket.city}
            layout="stacked"
            className="mt-2"
          />
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <TicketIcon className="h-4 w-4 shrink-0 text-navy-600" aria-hidden />
            <span className="truncate">
              {ticket.holderName} · {ticket.id}
            </span>
          </p>
          {ticket.checkedInAt && (
            <Alert tone="warning" className="mt-3">
              Check-in pada {formatDateTime(ticket.checkedInAt)}
            </Alert>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <QrPlaceholder token={ticket.qrToken} className="w-32" />
          <ButtonLink href={`/tickets/${ticket.id}`} size="sm" variant="outline">
            <QrCode className="h-3.5 w-3.5" aria-hidden /> Buka QR
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

export function ETicket({ ticket }: { ticket: Ticket }) {
  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-900 px-5 py-3 text-white">
        <span className="eyebrow text-gold-300">
          {ticket.ticketTypeName}
        </span>
        <StatusBadge value={ticket.status} map={ticketStatusMeta} />
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="type-subhead truncate text-navy-900">
          {ticket.eventTitle}
        </h2>
        <EventMeta
          date={ticket.eventDate}
          time={ticket.eventDate}
          venue={ticket.venue}
          city={ticket.city}
          className="mt-2"
        />
      </div>

      <div className="grid place-items-center px-6 pb-6">
        <QrPlaceholder token={ticket.qrToken} className="w-56 max-w-full" />
        <p className="mt-4 text-center text-xs text-muted">{QR_CAUTION}</p>
      </div>

      <div className="mx-6 border-t border-dashed border-line" />

      <dl className="grid gap-3 p-6 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs text-muted">Nama pemegang tiket</dt>
          <dd className="truncate font-semibold text-navy-900">{ticket.holderName}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted">ID Tiket</dt>
          <dd className="truncate font-mono font-semibold text-navy-900">{ticket.id}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted">Order ID</dt>
          <dd className="truncate font-mono text-navy-900">{ticket.orderId}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted">Kode QR</dt>
          <dd className="break-all font-mono text-xs text-navy-900">{ticket.qrToken}</dd>
        </div>
      </dl>

      <div className="border-t border-line bg-canvas px-6 py-3 text-center text-xs text-muted">
        Tiket resmi diterbitkan oleh TiketKu. Jangan bagikan QR ini ke orang lain.
      </div>
    </article>
  );
}
