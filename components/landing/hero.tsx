import {
  ArrowRight,
  CircleCheck,
  Lock,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { categoryMeta } from "@/lib/constants";

export function LandingHero() {
  const categories = Object.keys(categoryMeta).slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      {/* ───────────── Background Glow ───────────── */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -bottom-20 right-1/4 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-gold-500/15 blur-[80px]" />
      </div>

      {/* Padding dipangkas signifikan agar compact */}
      <div className="page-container relative z-10 flex flex-col items-center pt-12 pb-20 text-center lg:pt-16 lg:pb-24">
        {/* Badge Atas */}
        <Badge
          tone="glass"
          className="mb-5 border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-md"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold-300" />
          Platform tiket resmi #1 di Indonesia
        </Badge>

        {/* Judul Utama */}
        <h1 className="type-hero max-w-3xl text-white">
          Nonton event keren,{" "}
          <span className="type-hero-accent text-gold-300">
            Tinggal klik aja.
          </span>
        </h1>

        {/* Deskripsi (Jarak dirapatkan) */}
        <p className="body-copy-lg mt-3 max-w-xl text-white/70">
          Konser, festival, konferensi, hingga workshop dalam satu tempat.
          Checkout cepat, pembayaran aman.
        </p>

        {/* ───────────── PRIMARY CTA: Search Bar ───────────── */}
        <div className="mt-7 w-full max-w-lg">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-4 backdrop-blur-md transition-colors focus-within:bg-white/10 hover:bg-white/10">
            <Search className="h-4 w-4 text-white/50" />
            <input
              type="text"
              placeholder="Cari event, artis, atau venue..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              disabled
            />
            <ButtonLink
              href="/events"
              className="shrink-0 rounded-full bg-white px-6 py-2 text-navy-900 hover:bg-white/90"
            >
              Cari
            </ButtonLink>
          </div>

          {/* Quick Links (Chips) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs text-white/50">Populer:</span>
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/events?category=${cat}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                {categoryMeta[cat as keyof typeof categoryMeta].label}
              </a>
            ))}
          </div>
        </div>

        {/* ───────────── SECONDARY CTA (Text Link) ───────────── */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/60">
          <span>Punya event?</span>
          <ButtonLink
            href="/register"
            variant="ghost"
            className="h-auto p-0 text-gold-300 hover:bg-transparent hover:text-gold-400"
          >
            Jual tiket eventmu di sini{" "}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </ButtonLink>
        </div>

        {/* ───────────── Trust Indicators ───────────── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-gold-300" aria-hidden />{" "}
            Pembayaran aman
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="h-3.5 w-3.5 text-gold-300" aria-hidden />{" "}
            100% Tiket resmi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-gold-300" aria-hidden />{" "}
            Refund transparan
          </span>
        </div>
      </div>
    </section>
  );
}
