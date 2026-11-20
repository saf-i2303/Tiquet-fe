"use client";

import { useEffect, useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QR_CAUTION } from "@/components/ticket/ticket-card";
import { formatDate, formatTime } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

export function TicketActions({ ticket }: { ticket: Ticket }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const summary = [
    `E-Ticket ${ticket.id}`,
    ticket.eventTitle,
    `${formatDate(ticket.eventDate, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })} · ${formatTime(ticket.eventDate)}`,
    `${ticket.venue} · ${ticket.city}`,
    `Kategori: ${ticket.ticketTypeName}`,
    `Pemegang: ${ticket.holderName}`,
    `Order: ${ticket.orderId}`,
    `Kode QR: ${ticket.qrToken}`,
    "",
    QR_CAUTION,
  ].join("\n");

  function downloadTicket() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${ticket.id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function shareTicket() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: ticket.eventTitle, text: summary });
        return;
      } catch {
        // User cancelled or share failed — fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={downloadTicket}>
          <Download className="h-3.5 w-3.5" aria-hidden /> Unduh
        </Button>
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={shareTicket}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden /> Tersalin
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" aria-hidden /> Bagikan
            </>
          )}
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Unduh menyimpan detail tiket sebagai file teks. Bagikan menyalin detail tiket bila
        perangkat tidak mendukung share sheet.
      </p>
    </div>
  );
}
