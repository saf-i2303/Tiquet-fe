import Link from "next/link";
import { ArrowRight, Building2, Sparkles, Star } from "lucide-react";
import { EventCover } from "@/components/event/event-cover";
import { EventMeta } from "@/components/shared/event-meta";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { categoryMeta } from "@/lib/constants";
import { cn, percent } from "@/lib/utils";
import type { EventWithStats } from "@/types/event";

export function EventCard({
  event,
  tilt,
  className,
}: {
  event: EventWithStats;
  tilt?: string;
  className?: string;
}) {
  const meta = categoryMeta[event.category];
  const soldRatio = percent(event.totalSold, event.totalQuota);
  const remaining = Math.max(0, event.totalQuota - event.totalSold);
  const promo = event.promoLabel ?? (soldRatio >= 85 ? "HAMPIR HABIS" : null);

  return (
    <article className={cn("card card-hover group flex flex-col overflow-hidden", tilt, className)}>
      <Link href={`/events/${event.id}`} className="relative block" aria-label={`Lihat ${event.title}`}>
        <EventCover event={event} className="h-44" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Badge tone="navy" className="border-white/20 bg-navy-950/55 text-white backdrop-blur-sm">
            {meta.label}
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-navy-950/55 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
            {event.rating.toFixed(1)}
          </span>
        </div>

        {promo && (
          <span className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 truncate rounded-full bg-gold-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-900 shadow-card">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{promo}</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/events/${event.id}`}>
          <h3 className="type-subhead line-clamp-2 text-navy-900 transition group-hover:text-navy-600">
            {event.title}
          </h3>
        </Link>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <Building2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">oleh {event.organizerName}</span>
        </p>

        <EventMeta
          date={event.date}
          endDate={event.endDate}
          venue={event.venue}
          city={event.city}
          layout="stacked"
          className="mt-3"
        />

        <div className="mt-4">
          <Progress value={event.totalSold} total={event.totalQuota} showLabel={false} />
          <p className="mt-1.5 text-xs text-muted">
            <span className="font-semibold text-navy-900">{remaining.toLocaleString("id-ID")}</span>{" "}
            tiket tersisa · {soldRatio}% terjual
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            <div className="text-xs text-muted">Mulai dari</div>
            <Price value={event.minPrice} short className="text-base" />
          </div>
          <ButtonLink href={`/events/${event.id}/tickets`} size="sm" className="shrink-0">
            Pesan <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
