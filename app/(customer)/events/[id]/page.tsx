import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Star,
  Ticket,
} from "lucide-react";
import { CategoryIcon } from "@/components/event/category-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BenefitList } from "@/components/ui/benefit-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { categoryMeta } from "@/lib/constants";
import { formatDate, formatTime, percent } from "@/lib/utils";
import { getEventById } from "@/services/event.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event tidak ditemukan" };
  return {
    title: `${event.title}`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const meta = categoryMeta[event.category];
  const soldRatio = percent(event.totalSold, event.totalQuota);

  return (
    <main className="page-container py-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy-900">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/events" className="hover:text-navy-900">
          Events
        </Link>
        <span>/</span>
        <Link href={`/events?category=${event.category}`} className="hover:text-navy-900">
          {meta.label}
        </Link>
      </nav>

      <section className="card mt-4 overflow-hidden">
        <div
          className={`relative grid min-h-56 place-items-center bg-gradient-to-br px-6 py-10 text-center ${meta.gradient}`}
        >
          {event.imageUrl && (
            <>
              <Image
                src={event.imageUrl}
                alt={`Promo ${event.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-navy-950/65" />
            </>
          )}
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
              {meta.label}
            </span>
            <CategoryIcon
              category={event.category}
              className="mx-auto mt-4 h-8 w-8 text-gold-300"
              strokeWidth={1.5}
            />
            <h1 className="type-page mx-auto mt-3 max-w-3xl text-white">
              {event.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {event.rating}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {event.organizerName}
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5" /> {event.totalSold.toLocaleString("id-ID")} tiket
                terjual
              </span>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5">
            <CardHeader title="Tentang event" />
            <p className="body-copy mt-3 text-navy-800">{event.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-control border border-line bg-canvas p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  <CalendarDays className="h-3.5 w-3.5" /> Tanggal
                </div>
                <div className="mt-1 font-semibold text-navy-900">
                  {formatDate(event.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" /> Mulai {formatTime(event.date)}
                  {event.endDate ? ` · Selesai ${formatTime(event.endDate)}` : ""}
                </div>
              </div>
              <div className="rounded-control border border-line bg-canvas p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  <MapPin className="h-3.5 w-3.5" /> Lokasi
                </div>
                <div className="mt-1 font-semibold text-navy-900">{event.venue}</div>
                <div className="mt-0.5 text-xs text-muted">{event.address}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Kategori tiket"
              action={
                <Badge tone={soldRatio >= 85 ? "amber" : "green"}>
                  {soldRatio >= 85 ? "Hampir habis" : "Tersedia"}
                </Badge>
              }
            />

            <div className="mt-4 space-y-3">
              {event.ticketTypes.map((ticket) => {
                const remaining = Math.max(0, ticket.quota - ticket.sold);
                return (
                  <div
                    key={ticket.id}
                    className="rounded-control border border-line p-4 transition hover:border-navy-900/25"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-navy-900">{ticket.name}</div>
                        <p className="mt-0.5 text-sm text-muted">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <Price value={ticket.price} className="text-lg" />
                        <div className="text-xs text-muted">
                          {remaining > 0 ? `Sisa ${remaining} tiket` : "Habis"}
                        </div>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-800">
                      {ticket.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-gold-600" /> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Harga mulai
            </div>
            <Price value={event.minPrice} className="mt-1 block text-3xl" />
            <div className="mt-4">
              <Progress
                value={event.totalSold}
                total={event.totalQuota}
                label="Tiket terjual"
              />
            </div>
            <ButtonLink href={`/events/${event.id}/tickets`} className="mt-4 w-full">
              Pilih Tiket <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <BenefitList
              items={[
                "Tiket resmi & e-ticket instan",
                "Pembayaran aman & terenkripsi",
                "Informasi event selalu terpantau",
              ]}
              itemClassName="text-xs"
              iconClassName="h-3.5 w-3.5"
            />
          </Card>

          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Diselenggarakan oleh
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={event.organizerName} />
              <div className="min-w-0">
                <div className="truncate font-semibold text-navy-900">{event.organizerName}</div>
                <div className="text-xs text-muted">Organizer terverifikasi</div>
              </div>
            </div>
            <ButtonLink
              href={`/events?q=${encodeURIComponent(event.organizerName)}`}
              variant="outline"
              size="sm"
              className="mt-4 w-full"
            >
              Lihat event lainnya
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </main>
  );
}
