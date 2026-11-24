"use client";

import { use, useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  ScanLine,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getAuditLogs } from "@/services/adminServices";
import type { AuditLog } from "@/types/admin";

const actorFilters = [
  { value: "", label: "Semua" },
  { value: "super_admin", label: "Super Admin" },
  { value: "organizer", label: "Organizer" },
  { value: "system", label: "System" },
];

function actorKey(log: AuditLog): string {
  if (log.actorRole === "Super Admin") return "super_admin";
  if (log.actorRole === "Organizer") return "organizer";
  return "system";
}

function actorIcon(log: AuditLog) {
  switch (actorKey(log)) {
    case "super_admin":
      return <ShieldCheck className="h-4 w-4" />;
    case "organizer":
      return <BadgeCheck className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function actionIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("pembayaran") || lower.includes("transaksi"))
    return <CreditCard className="h-3.5 w-3.5" />;
  if (lower.includes("check-in")) return <ScanLine className="h-3.5 w-3.5" />;
  if (lower.includes("event")) return <CalendarDays className="h-3.5 w-3.5" />;
  if (lower.includes("organizer")) return <BadgeCheck className="h-3.5 w-3.5" />;
  if (lower.includes("pengguna") || lower.includes("verifikasi"))
    return <UserCog className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

const dateKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);

export default function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; q?: string }>;
}) {
  const { actor = "", q = "" } = use(searchParams);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    getAuditLogs()
      .then((data) => {
        if (!active) return;
        setLogs(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setLogs([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const needle = q.trim().toLowerCase();
  const filtered = logs.filter((log) => {
    const matchActor = !actor || actorKey(log) === actor;
    const matchQuery =
      !needle ||
      log["action"].toLowerCase().includes(needle) ||
      log.target.toLowerCase().includes(needle) ||
      log.actor.toLowerCase().includes(needle);
    return matchActor && matchQuery;
  });

  const grouped = new Map<string, AuditLog[]>();
  for (const log of filtered) {
    const key = dateKey(log.at);
    const bucket = grouped.get(key) ?? [];
    bucket.push(log);
    grouped.set(key, bucket);
  }

  const superAdminCount = logs.filter((log) => actorKey(log) === "super_admin").length;
  const systemCount = logs.filter((log) => actorKey(log) === "system").length;

  return (
    <main>
      <PageHeader
        kicker="Audit trail"
        title="Log aktivitas"
        subtitle="Jejak audit seluruh tindakan penting admin, organizer, dan sistem di platform."
      />

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

      <div className="stat-grid mb-6">
        <StatTile
          label="Total aktivitas"
          value={logs.length}
          hint="Tercatat di sistem"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatTile
          label="Aksi super admin"
          value={superAdminCount}
          hint="Moderasi & verifikasi"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Aktivitas sistem"
          value={systemCount}
          hint="Webhook & otomatisasi"
          icon={<ScanLine className="h-4 w-4" />}
          tone="blue"
        />
        <StatTile
          label="Hasil filter"
          value={filtered.length}
          hint={actor ? `Aktor: ${actor}` : "Semua aktor"}
          tone="green"
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={actorFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/activity${filter.value ? `?actor=${filter.value}` : ""}`,
          active: actor === filter.value,
        }))}
        searchPlaceholder="Aksi, target, aktor..."
        defaultValue={q}
        hidden={{ actor }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-6 w-6" />}
          title="Belum ada aktivitas"
          description="Coba ubah filter aktor atau kata kunci pencarian."
          action={
            <ButtonLink href="/admin/activity" size="sm">
              Reset filter
            </ButtonLink>
          }
        />
      ) : (
        <div className="section-stack">
          {[...grouped.entries()].map(([day, items]) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader
                title={<span className="text-sm">{formatDate(`${day}T00:00:00`, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</span>}
                className="border-b border-line bg-surface px-4 py-2.5"
                action={<span className="text-xs text-muted">{items.length} aktivitas</span>}
              />
              <ol className="divide-y divide-line">
                {items.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-control bg-navy-900/5 text-navy-700">
                      {actorIcon(log)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-navy-900">
                          {actionIcon(log["action"])} {log["action"]}
                        </span>
                        <span className="text-xs text-muted">· {log.target}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {log.actor} ({log.actorRole}) · {formatDateTime(log.at)}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted">{log.id}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
