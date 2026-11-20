import { cn } from "@/lib/utils";

const SIZE = 15;

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function QrPlaceholder({ token, className }: { token: string; className?: string }) {
  const seed = hashSeed(token);
  const cells = Array.from({ length: SIZE * SIZE }, (_, index) => {
    const x = index % SIZE;
    const y = Math.floor(index / SIZE);

    const inFinder =
      (x < 4 && y < 4) || (x > SIZE - 5 && y < 4) || (x < 4 && y > SIZE - 5);

    if (inFinder) {
      const border = x === 0 || y === 0 || x === 3 || y === 3 || x === SIZE - 4 || x === SIZE - 1;
      const inner =
        (x === 1 && (y === 1 || y === 2)) ||
        (x === 2 && (y === 1 || y === 2)) ||
        (x === SIZE - 3 && (y === 1 || y === 2)) ||
        (x === SIZE - 2 && (y === 1 || y === 2)) ||
        (x === 1 && (y === SIZE - 3 || y === SIZE - 2)) ||
        (x === 2 && (y === SIZE - 3 || y === SIZE - 2));
      return border || inner;
    }

    return ((seed >> (index % 24)) + x * 7 + y * 13 + (seed % 5)) % 3 === 0;
  });

  return (
    <div
      className={cn(
        "grid gap-[2px] rounded-control border-4 border-navy-900 bg-surface p-2",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      role="img"
      aria-label={`QR code tiket ${token}`}
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={filled ? "aspect-square rounded-[1px] bg-navy-900" : "aspect-square"}
        />
      ))}
    </div>
  );
}
