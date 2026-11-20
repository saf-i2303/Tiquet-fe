import { BadgeCheck, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";

const signals = [
  { icon: BadgeCheck, label: "Tiket resmi dari organizer terverifikasi" },
  { icon: ShieldCheck, label: "Pembayaran aman dan terlindungi" },
  { icon: Wallet, label: "Harga transparan, tanpa biaya tersembunyi" },
  { icon: CheckCircle2, label: "E-tiket langsung tersedia di akun" },
];

export function LandingTrustStrip() {
  return (
    <div className="relative flex w-full overflow-hidden border-b border-line/70 bg-canvas py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-canvas to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-canvas to-transparent sm:w-16" />

      {/* Marquee track */}
      <div className="tiquet-trust-marquee flex w-max shrink-0 items-center">
        {[0, 1].map((group) => (
          <div
            key={group}
            className="flex shrink-0 items-center gap-10 pr-10"
            aria-hidden={group === 1}
          >
            {signals.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-navy-700"
              >
                <Icon className="size-4 shrink-0 text-gold-500" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
