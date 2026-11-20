import Image from "next/image";
import { Logo } from "@/components/layout/brand-logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-white">
      <section className="relative hidden min-h-screen w-[46%] flex-col justify-between overflow-hidden bg-navy-950 px-12 py-12 text-white lg:flex xl:px-16">
        <Image
          src="/images/hero.jpg"
          alt="Suasana acara langsung"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-900/60 to-navy-950/95" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />

        <Logo tone="light" className="relative z-10" />

        <div className="relative z-10 max-w-lg">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 text-xs font-medium text-gold-300 backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-gold-400" />
            Satu ruang untuk setiap acara
          </p>
          <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-[-0.035em] text-white xl:text-5xl">
            Dari ide acara sampai pintu masuk,{" "}
            <span className="text-gold-300">semua di satu tempat.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white">
            Buat event, kelola tiket, dan pantau peserta dalam alur yang jelas —
            tanpa kerjaan administratif yang berulang.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-white">
          <span className="flex -space-x-2">
            {["AT", "RK", "DP"].map((initials) => (
              <span
                key={initials}
                className="flex size-8 items-center justify-center rounded-full border-2 border-navy-950 bg-navy-800 text-xs font-semibold text-white shadow-sm ring-1 ring-gold-500/30"
              >
                {initials}
              </span>
            ))}
          </span>
          Dipercaya oleh penyelenggara dan peserta acara.
        </div>
      </section>

      <section className="relative flex min-h-screen flex-1 flex-col items-center justify-center bg-white px-5 py-12 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gold-500/5 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <Logo tone="dark" className="absolute left-8 top-8 lg:hidden" />

        <div className="relative z-10 w-full max-w-[420px]">{children}</div>

        <p className="absolute bottom-8 text-xs font-medium text-muted">
          © {new Date().getFullYear()} Tiquet. Hak cipta dilindungi.
        </p>
      </section>
    </div>
  );
}
