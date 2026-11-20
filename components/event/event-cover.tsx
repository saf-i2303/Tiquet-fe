import Image from "next/image";
import { CategoryIcon } from "@/components/event/category-icon";
import { categoryMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EventWithStats } from "@/types/event";

/**
 * Event cover with a graceful fallback: events without a promo image keep the
 * category gradient + icon, so newly created events never render a broken image.
 */
export function EventCover({
  event,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  event: EventWithStats;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const meta = categoryMeta[event.category];

  return (
    <div className={cn("relative overflow-hidden bg-navy-900", className)}>
      {event.imageUrl ? (
        <Image
          src={event.imageUrl}
          alt={`Promo ${event.title}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          className={cn("absolute inset-0 grid place-items-center bg-gradient-to-br", meta.gradient)}
        >
          <CategoryIcon
            category={event.category}
            className="h-12 w-12 text-gold-300"
            strokeWidth={1.5}
          />
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/5 to-transparent"
      />
    </div>
  );
}
