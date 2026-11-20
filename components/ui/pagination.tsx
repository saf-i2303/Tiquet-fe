import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export function Pagination({
  page,
  totalPages,
  params = {},
}: {
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") search.set(key, value);
    });
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `?${query}` : "?";
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  const disabled = buttonStyles({ variant: "outline", size: "sm" });

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <ButtonLink
          href={hrefFor(page - 1)}
          variant="outline"
          size="sm"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </ButtonLink>
      ) : (
        <span className={`${disabled} pointer-events-none opacity-40`} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const showGap = previous !== undefined && item - previous > 1;

        return (
          <span key={item} className="flex items-center gap-1">
            {showGap && <span className="px-1 text-muted">…</span>}
            <ButtonLink
              href={hrefFor(item)}
              aria-current={item === page ? "page" : undefined}
              variant={item === page ? "gold" : "outline"}
              size="sm"
              className="min-w-9"
            >
              {item}
            </ButtonLink>
          </span>
        );
      })}

      {page < totalPages ? (
        <ButtonLink
          href={hrefFor(page + 1)}
          variant="outline"
          size="sm"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </ButtonLink>
      ) : (
        <span className={`${disabled} pointer-events-none opacity-40`} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
