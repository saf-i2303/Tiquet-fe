import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

/**
 * QR asli (bukan pola dekoratif): value-nya adalah token tiket sehingga bisa
 * dipindai scanner gate. Komponen ini aman di Server Component (SVG murni).
 */
export function QrPlaceholder({ token, className }: { token: string; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex rounded-control border-4 border-navy-900 bg-surface p-2",
        className,
      )}
      role="img"
      aria-label={`QR code tiket ${token}`}
    >
      <QRCodeSVG
        value={token}
        size={160}
        level="M"
        bgColor="#ffffff"
        fgColor="#0f172a"
        className="h-auto w-full"
        title={`QR code tiket ${token}`}
      />
    </div>
  );
}
