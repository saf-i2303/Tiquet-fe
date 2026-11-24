"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock,
  Receipt,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import {
  getProfileInsights,
  type ProfileInsights,
  type ProfileStatIcon,
} from "@/services/profileServices";
import type { Role } from "@/types/user";

const statIcons: Record<ProfileStatIcon, ComponentType<{ className?: string }>> = {
  orders: Receipt,
  paid: BadgeCheck,
  pending: Clock,
  wallet: Wallet,
  events: CalendarDays,
  published: CalendarDays,
  team: Users,
  verified: ShieldCheck,
  scan: ScanLine,
  today: Clock,
  valid: CircleCheck,
  review: TriangleAlert,
  organizers: Users,
  moderation: ShieldCheck,
};

/** Bagian bawah profil: stat + riwayat/rangkuman yang seragam untuk semua role. */
export function ProfileInsights({
  role,
  staffId,
  organizerId,
}: {
  role: Role;
  staffId?: string;
  organizerId?: string;
}) {
  const [data, setData] = useState<ProfileInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      // Tunda satu tick agar setState tidak terjadi sinkron di dalam effect.
      await Promise.resolve();
      const result = await getProfileInsights(role, { id: staffId, organizerId });
      if (!active) return;
      setData(result);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [role, staffId, organizerId]);

  if (isLoading || !data) {
    return (
      <section className="space-y-4" aria-busy="true" aria-label="Memuat ringkasan akun">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-card" />
          ))}
        </div>
        <Skeleton className="h-56 rounded-card" />
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Ringkasan akun">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-gold-600">Ringkasan akun</p>
          <h2 className="type-subhead mt-1 text-navy-900">Aktivitas &amp; riwayat</h2>
        </div>
        {data.activityHref && (
          <Link
            href={data.activityHref}
            className="text-sm font-semibold text-info transition hover:text-navy-900"
          >
            {data.activityHrefLabel ?? "Lihat detail"} →
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              tone={stat.tone}
              icon={<Icon className="h-4 w-4" aria-hidden="true" />}
            />
          );
        })}
      </div>

      {data.notice && <Alert tone="info">{data.notice}</Alert>}

      <Card className="overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-navy-900 to-navy-800 px-5 py-3.5">
          <h3 className="type-label text-white">{data.activityTitle}</h3>
        </div>

        {data.activities.length === 0 ? (
          <EmptyState
            className="m-4"
            title="Belum ada aktivitas"
            description="Data akan muncul di sini setelah ada aktivitas yang tercatat untuk akun ini."
            icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          />
        ) : (
          <ul className="divide-y divide-line">
            {data.activities.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-canvas/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  {activity.href ? (
                    <Link
                      href={activity.href}
                      className="type-label text-navy-900 transition hover:text-gold-600"
                    >
                      {activity.title}
                    </Link>
                  ) : (
                    <div className="type-label text-navy-900">{activity.title}</div>
                  )}
                  {activity.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {activity.subtitle}
                    </p>
                  )}
                  {activity.meta && (
                    <p className="mt-1 text-xs text-muted">{activity.meta}</p>
                  )}
                </div>
                {activity.status && (
                  <Badge tone={activity.statusTone ?? "slate"} className="self-start">
                    {activity.status}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
