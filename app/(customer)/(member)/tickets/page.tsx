"use client";

import { useEffect, useMemo, useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { TicketCard } from "@/components/ticket/ticket-card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatTile } from "@/components/ui/stat-tile";
import { getUserFromStorage } from "@/lib/api";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { getTicketsByCustomer } from "@/services/ticketServices";
import type { Ticket } from "@/types/ticket";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const session = useMemo(
    () =>
      user ?? getUserFromStorage() ?? (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;

    getTicketsByCustomer(session.id)
      .then((data) => {
        if (!active) return;
        setTickets(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (active) setErrorMsg("Gagal memuat tiket");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  const active = tickets.filter((ticket) => ticket.status === "active");
  const used = tickets.filter((ticket) => ticket.status !== "active");

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
        kicker="E-ticket"
        title="Tiket saya"
        subtitle="Semua tiket aktif dan riwayat check-in kamu ada di sini."
        action={
          <ButtonLink href="/events" size="sm">
            Cari event baru
          </ButtonLink>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Tiket aktif"
          value={active.length}
          hint="Siap dipakai di gate"
          icon={<TicketIcon className="h-4 w-4" />}
        />
        <StatTile
          label="Sudah check-in"
          value={used.filter((ticket) => ticket.status === "used").length}
          hint="Riwayat kehadiran"
          tone="green"
        />
        <StatTile
          label="Total tiket"
          value={tickets.length}
          hint="Seluruh tiket yang dimiliki"
          tone="gold"
        />
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="h-5 w-5" />}
          title="Belum ada tiket"
          description="Begitu kamu menyelesaikan pembayaran, e-ticket dan QR code akan muncul otomatis di sini."
          action={<ButtonLink href="/events">Jelajahi event</ButtonLink>}
        />
      ) : (
        <div className="space-y-6">
          <section>
            <SectionHeading title="Tiket aktif" className="mb-3" />
            {active.length === 0 ? (
              <EmptyState
                title="Tidak ada tiket aktif"
                description="Tiket yang sudah dipakai ada di bawah."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {active.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </section>

          {used.length > 0 && (
            <section>
              <SectionHeading title="Riwayat tiket" className="mb-3" />
              <div className="grid gap-4 lg:grid-cols-2">
                {used.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
