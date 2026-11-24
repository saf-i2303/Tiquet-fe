"use client";

import {
  CalendarDays,
  MapPin,
  RefreshCcw,
  ScanLine,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { eventStatusMeta, type Tone } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { clearLocalCheckIns, getCheckIns } from "@/services/checkin.service";
import { getEvents } from "@/services/eventServices";
import type { CheckIn, CheckInResult } from "@/types/checkin";
import type { EventWithStats } from "@/types/event";

const resultMeta: Record<CheckInResult, { label: string; tone: Tone }> = {
  valid: { label: "Valid", tone: "green" },
  duplicate: { label: "Duplikat", tone: "amber" },
  invalid: { label: "Tidak valid", tone: "red" },
};

export default function GateDashboardPage() {
  const { user } = useAuth();
  const staffId = user?.id;
  const organizerId = user?.organizerId;

  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [scopeApplied, setScopeApplied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setEventError(null);

      try {
        const history = await getCheckIns(undefined, staffId);
        if (active) setCheckIns(history);
      } catch {
        if (active) setCheckIns([]);
      }

      try {
        const page = await getEvents({ page: 1, perPage: 20, sort: "soonest" });
        if (!active) return;

        const published = page.items.filter(
          (event) => event.status === "published",
        );
        const canScope =
          Boolean(organizerId) &&
          published.some((event) => Boolean(event.organizerId));
        setScopeApplied(canScope);
        setEvents(
          canScope
            ? published.filter((event) => event.organizerId === organizerId)
            : published,
        );
      } catch (error) {
        if (active) {
          setEventError(
            error instanceof Error ? error.message : "Gagal memuat daftar event.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [organizerId, staffId, refreshKey]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: checkIns.length,
      today: checkIns.filter(
        (item) => new Date(item.at).toDateString() === today,
      ).length,
      valid: checkIns.filter((item) => item.result === "valid").length,
      duplicate: checkIns.filter((item) => item.result === "duplicate").length,
      invalid: checkIns.filter((item) => item.result === "invalid").length,
    };
  }, [checkIns]);

  const statCards = [
    { label: "Scan hari ini", value: summary.today, tone: "blue" as Tone },
    { label: "Check-in valid", value: summary.valid, tone: "green" as Tone },
    { label: "Duplikat", value: summary.duplicate, tone: "amber" as Tone },
    { label: "Tidak valid", value: summary.invalid, tone: "red" as Tone },
  ];

  const handleClearHistory = () => {
    clearLocalCheckIns(staffId);
    setCheckIns([]);
  };

  return (
    <>
      <PageHeader
        kicker="Gate Staff"
        title="Dashboard scan"
        subtitle="Pantau event aktif dan riwayat check-in yang tercatat dari perangkat ini."
        action={
          <ButtonLink href="/scan" variant="navy">
            <ScanLine className="mr-2 h-4 w-4" /> Mulai scan
          </ButtonLink>
        }
      />

      <div className="space-y-6">
        <Alert tone="info">
          {scopeApplied
            ? "Event aktif difilter berdasarkan ID organizer pada sesi staff ini."
            : organizerId
              ? "Sesi staff memiliki ID organizer, tetapi respons event publik tidak menyertakan organizer_id. Daftar di bawah adalah event aktif yang tersedia dan belum difilter per organizer."
              : "Backend belum mengirim ID organizer untuk akun gate staff. Daftar di bawah memakai event publik aktif yang tersedia, jadi belum bisa dipastikan milik organizer yang sama."}
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-xs font-medium text-muted">{stat.label}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-2xl font-bold text-navy-900">
                  {stat.value}
                </span>
                <Badge tone={stat.tone}>{stat.label}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="p-5">
            <CardHeader
              title="Event aktif"
              description={
                isLoading
                  ? "Memuat event..."
                  : `${events.length} event publik aktif ditemukan`
              }
              action={<Badge tone="green">Published</Badge>}
            />

            <div className="mt-4 space-y-3">
              {eventError ? <Alert tone="danger">{eventError}</Alert> : null}

              {!isLoading && !eventError && events.length === 0 ? (
                <div className="rounded-control border border-dashed border-line bg-canvas p-6 text-center text-sm text-muted">
                  Belum ada event aktif yang bisa ditampilkan.
                </div>
              ) : null}

              {events.map((event) => {
                const status = eventStatusMeta[event.status];
                const location = [event.venue, event.city].filter(Boolean).join(", ");
                return (
                  <div
                    key={event.id}
                    className="rounded-control border border-line bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-900">
                          {event.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(event.date, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge tone={status?.tone ?? "green"}>
                        {status?.label ?? "Aktif"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      {location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {location}
                        </span>
                      ) : null}
                      {event.organizerName ? (
                        <span>Organizer: {event.organizerName}</span>
                      ) : null}
                      <span className="font-mono">{event.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Riwayat scan"
              description="Tersimpan lokal di browser, bukan data server."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setRefreshKey((value) => value + 1)}
                  >
                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Muat ulang
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={summary.total === 0}
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              }
            />

            <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
              {checkIns.length === 0 ? (
                <div className="rounded-control border border-dashed border-line bg-canvas p-6 text-center text-sm text-muted">
                  Belum ada scan. Hasil scan dari halaman Scan Tiket akan muncul
                  di sini.
                </div>
              ) : (
                checkIns.map((entry) => {
                  const meta = resultMeta[entry.result];
                  return (
                    <div
                      key={entry.id}
                      className="rounded-control border border-line bg-canvas p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy-900">
                            {entry.holderName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {entry.eventTitle}
                          </p>
                          <p className="mt-1 break-all font-mono text-[11px] text-muted">
                            {entry.ticketId}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          <p className="mt-1 text-[11px] text-muted">
                            {formatDateTime(entry.at)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-muted">
                        {entry.gate} • {entry.staffName}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <Alert tone="warning" className="mt-4">
              Riwayat dan statistik di atas adalah data lokal/demo. Backend belum
              menyediakan endpoint check-in, jadi data ini tidak tersinkron antar
              perangkat.
            </Alert>
          </Card>
        </div>
      </div>
    </>
  );
}
