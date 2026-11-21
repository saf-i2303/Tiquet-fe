import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { CategoryEventGroups } from "@/components/event/category-event-groups";
import { EventCard } from "@/components/event/event-card";
import { EventFilters } from "@/components/event/event-filters";
import { PromoBanner } from "@/components/event/promo-banner";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { categoryMeta } from "@/lib/constants";
import { getEventCities, getEvents, getEventsGroupedByCategory } from "@/services/eventServices";
import type { EventQuery } from "@/types/event";

export const metadata: Metadata = {
  title: "Jelajahi Event",
  description: "Cari konser, konferensi, festival, komedi, dan workshop terbaik di sekitarmu.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const category = first(params.category) ?? "";
  const city = first(params.city) ?? "";
  const date = first(params.date) ?? "";
  const sortRaw = first(params.sort) ?? "soonest";
  const sort = (["soonest", "cheapest", "popular"] as const).includes(
    sortRaw as EventQuery["sort"] & string,
  )
    ? (sortRaw as EventQuery["sort"])
    : "soonest";
  const page = Math.max(1, Number(first(params.page) ?? 1) || 1);

  const query: EventQuery = { q, category, city, date, sort, page };
  const [result, cityOptions, categoryGroups] = await Promise.all([
    getEvents(query),
    getEventCities(),
    getEventsGroupedByCategory(),
  ]);
  const activeCategory = category ? categoryMeta[category as keyof typeof categoryMeta] : null;
  const isUnfiltered = !q && !category && !city && !date;
  const promoEvent = isUnfiltered
    ? (result.items.find((event) => event.featured) ?? result.items[0])
    : undefined;

  return (
    <main className="page-container py-8">
      <PageHeader
        kicker="Event discovery"
        title={activeCategory ? `Event ${activeCategory.label}` : "Temukan event"}
        subtitle="Filter sesuai kota, kategori, dan tanggal. Semua tiket dari organizer terverifikasi."
      />

      <EventFilters query={query} cityOptions={cityOptions} />

      {promoEvent && (
        <div className="mt-6">
          <PromoBanner event={promoEvent} />
        </div>
      )}

      <p className="mt-8 text-sm text-muted">
        Menampilkan <span className="font-semibold text-navy-900">{result.items.length}</span> dari{" "}
        <span className="font-semibold text-navy-900">{result.pagination.total_items}</span> event
        {q && (
          <>
            {" "}
            untuk <span className="font-semibold text-navy-900">&ldquo;{q}&rdquo;</span>
          </>
        )}
      </p>

      {result.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="Event tidak ditemukan"
            description="Coba ubah kata kunci, kategori, atau kota untuk melihat hasil lain."
            action={<ButtonLink href="/events">Reset filter</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <Pagination
        page={result.pagination.page}
        totalPages={result.pagination.total_pages}
        params={{ q, category, city, date, sort }}
      />

      <CategoryEventGroups groups={categoryGroups} />
    </main>
  );
}
