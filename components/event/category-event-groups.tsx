import Link from "next/link";
import { CategoryIcon } from "@/components/event/category-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CategoryEventGroup } from "@/services/eventServices";

/**
 * Compact category navigation shown below the filtered catalogue.
 * It intentionally links to filtered results instead of repeating event rows.
 */
export function CategoryEventGroups({ groups }: { groups: CategoryEventGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section className="mt-12 border-t border-line pt-8" aria-label="Kategori event">
      <SectionHeading
        title="Jelajahi berdasarkan kategori"
        description="Pilih kategori untuk melihat event yang tersedia."
        className="mb-4"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {groups.map((group) => (
          <Link
            key={group.category}
            href={`/events?category=${group.category}`}
            className="card card-hover flex items-center gap-3 p-4"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-navy-900/5">
              <CategoryIcon category={group.category} className="h-4 w-4 text-navy-900" />
            </span>
            <span className="min-w-0">
              <span className="type-label block truncate text-navy-900">{group.label}</span>
              <span className="text-xs text-muted">{group.total} event</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
