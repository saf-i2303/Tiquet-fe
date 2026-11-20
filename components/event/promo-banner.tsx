import Image from "next/image";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Price } from "@/components/ui/price";
import { formatDate } from "@/lib/utils";
import type { EventWithStats } from "@/types/event";

/** Large promo feature shown above the event grid on an unfiltered listing. */
export function PromoBanner({ event }: { event: EventWithStats }) {
  return (
    <section className="card relative overflow-hidden" aria-label="Event pilihan">
      <div className="absolute inset-0">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={`Promo ${event.title}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/10" />
      </div>

      <div className="relative flex min-h-[320px] flex-col justify-end p-6 sm:p-8 lg:max-w-[62%]">
        <Badge tone="gold" className="w-fit">
          Promo spesial · Event pilihan
        </Badge>

        <h2 className="type-page mt-3 text-white">{event.title}</h2>
        <p className="body-copy mt-2 line-clamp-2 text-white/70">{event.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-300" />
            {formatDate(event.date, { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-300" />
            {event.venue}, {event.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star aria-hidden="true" className="h-4 w-4 shrink-0 fill-gold-400 text-gold-400" />
            {event.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="mr-1">
            <div className="text-xs text-white/60">Tiket mulai dari</div>
            <Price value={event.minPrice} className="text-xl text-white" />
          </div>
          <ButtonLink href={`/events/${event.id}/tickets`} size="sm">
            Pesan sekarang
          </ButtonLink>
          <ButtonLink href={`/events/${event.id}`} variant="popGhost" size="sm">
            Lihat detail
          </ButtonLink>
        </div>

        {event.promoLabel && (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-300">
            {event.promoLabel}
          </p>
        )}
      </div>
    </section>
  );
}
