import Link from "next/link";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryMeta, cities, sortOptions } from "@/lib/constants";
import type { EventQuery } from "@/types/event";

export function EventFilters({
  query,
  cityOptions = cities,
}: {
  query: EventQuery;
  cityOptions?: string[];
}) {
  return (
    <form
      action="/events"
      method="get"
      className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-12"
    >
      <label className="relative sm:col-span-2 lg:col-span-3">
        <span className="sr-only">Cari event</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={query.q}
          placeholder="Cari event, artis, venue..."
          className="input pl-9"
        />
      </label>

      <label className="lg:col-span-2">
        <span className="sr-only">Kategori</span>
        <select name="category" defaultValue={query.category ?? ""} className="input">
          <option value="">Semua kategori</option>
          {Object.entries(categoryMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:col-span-2">
        <span className="sr-only">Kota</span>
        <select name="city" defaultValue={query.city ?? ""} className="input">
          <option value="">Semua kota</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="lg:col-span-2">
        <span className="sr-only">Tanggal</span>
        <input type="date" name="date" defaultValue={query.date ?? ""} className="input" />
      </label>

      <div className="flex gap-2 lg:col-span-3">
        <label className="flex-1">
          <span className="sr-only">Urutkan</span>
          <select name="sort" defaultValue={query.sort ?? "soonest"} className="input">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" className="shrink-0">
          Cari
        </Button>
      </div>

      <div className="sm:col-span-2 lg:col-span-12">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-navy-900"
        >
          <RotateCcw className="h-3 w-3" /> Reset filter
        </Link>
      </div>
    </form>
  );
}
