import {
  Banknote,
  MousePointerClick,
  Shield,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  Ticket,
  ScanLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionContainer } from "@/components/ui/section-container";
import Link from "next/link";
import { CategoryIcon } from "@/components/event/category-icon";
import { EventCard } from "@/components/event/event-card";
import { categoryMeta } from "@/lib/constants";
import type { EventWithStats } from "@/types/event";

const stats = [
  { value: "10.000+", label: "Event terdaftar" },
  { value: "500RB+", label: "Tiket terjual" },
  { value: "1.200+", label: "Organizer aktif" },
  { value: "4.9/5", label: "Rating pengguna" },
];

const pillars = [
  {
    Icon: Shield,
    title: "Tiket resmi & anti-calo",
    desc: "Semua tiket diterbitkan oleh organizer yang telah melalui proses verifikasi ketat.",
  },
  {
    Icon: MousePointerClick,
    title: "Checkout < 60 detik",
    desc: "Pilih tiket, bayar, lalu e-tiket langsung tersedia di akunmu tanpa ribet.",
  },
  {
    Icon: Banknote,
    title: "Refund transparan",
    desc: "Kebijakan pembatalan dan pengembalian dana dijelaskan dengan sangat jelas.",
  },
  {
    Icon: TrendingUp,
    title: "EO terkurasi",
    desc: "Hanya organizer terverifikasi dan terpercaya yang dapat menjual tiket di sini.",
  },
];

const steps = [
  {
    n: "01",
    title: "Cari event",
    desc: "Saring berdasarkan kategori, kota, atau tanggal.",
    Icon: Search,
  },
  {
    n: "02",
    title: "Pesan tiket",
    desc: "Pilih jenis tiket dan selesaikan pembayaran.",
    Icon: Ticket,
  },
  {
    n: "03",
    title: "Masuk venue",
    desc: "Tunjukkan kode QR dari e-tiket saat check-in.",
    Icon: ScanLine,
  },
];

// ─────────────────────────────────────────────────────────────
// 1. STATS SECTION
// ─────────────────────────────────────────────────────────────
export function LandingStats() {
  return (
    <section className="relative z-10 -mt-10 bg-transparent pb-4">
      <SectionContainer spacing="py-0">
        <Card className="grid grid-cols-2 gap-px overflow-hidden border-line bg-line sm:grid-cols-4 shadow-lg shadow-navy-900/5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center justify-center bg-white p-5 text-center transition-colors hover:bg-canvas sm:p-6"
            >
              <span className="text-3xl font-black tracking-tight text-navy-900 transition-colors group-hover:text-gold-600 sm:text-4xl">
                {stat.value}
              </span>
              {/* Garis aksen emas kecil di bawah angka */}
              <span className="mt-2 h-0.5 w-6 rounded-full bg-gold-400/0 transition-all duration-300 group-hover:w-10 group-hover:bg-gold-400" />
              <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </Card>
      </SectionContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PILLARS SECTION (dengan aksen gold pada ikon & divider)
// ─────────────────────────────────────────────────────────────
export function LandingPillars() {
  return (
    <section id="keunggulan" className="scroll-mt-20 bg-white py-10 lg:py-14">
      <SectionContainer>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Badge tone="gold" className="mb-3">
            <Sparkles className="mr-1 h-3.5 w-3.5 text-gold-600" />
            Keunggulan Utama
          </Badge>
          <h2 className="type-section text-navy-900">
            Kenapa anak muda{" "}
            <span className="text-gold-500">pindah ke sini?</span>
          </h2>
          <p className="body-copy mt-2 text-muted">
            Pengalaman terbaik dari detik pertama mencari tiket, hingga masuk ke
            dalam venue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ Icon, title, desc }) => (
            <Card
              key={title}
              className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-lg hover:shadow-gold-500/10"
            >
              {/* Glow gold di sudut kanan atas */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />

              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/5 transition-colors duration-300 group-hover:bg-gold-100">
                  <Icon
                    className="h-5 w-5 text-navy-900 transition-colors duration-300 group-hover:text-gold-600"
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
                <h3 className="type-subhead mt-4 text-navy-900">{title}</h3>
                <p className="body-copy mt-1.5 text-[13px] leading-relaxed text-muted">
                  {desc}
                </p>
                {/* Garis emas tipis bawah sebagai penutup card */}
                <span className="mt-4 block h-0.5 w-0 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-12" />
              </div>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. STEPS SECTION (angka raksasa & ikon dengan aksen gold)
// ─────────────────────────────────────────────────────────────
export function LandingSteps() {
  return (
    <section
      id="cara-kerja"
      className="relative scroll-mt-20 overflow-hidden border-t border-line bg-canvas py-12 lg:py-16"
    >
      <SectionContainer>
        {/* Header Section */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge
            tone="navy"
            className="mb-4 border-line bg-white text-navy-900 shadow-sm"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 text-gold-500" /> Cuma 3
            Langkah
          </Badge>
          <h2 className="type-section text-navy-900">
            Dari scroll ke <span className="text-gold-500">gate venue</span>
          </h2>
          <p className="body-copy mt-3 text-muted">
            Tanpa drama, tanpa langkah yang tidak perlu.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-12 md:grid-cols-3 md:gap-8 pt-8">
          <div className="absolute left-[16%] right-[16%] top-[72px] hidden h-px border-t-2 border-dashed border-gold-500/30 md:block" />

          {steps.map((step) => (
            <div
              key={step.n}
              className="group relative flex flex-col items-center text-center"
            >
          
              {/* Teks */}
              <div className="relative z-10 mt-2">
                <h3 className="text-lg font-bold text-navy-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 flex justify-center">
          <ButtonLink
            href="/events"
            size="lg"
            className="shadow-lg shadow-navy-900/15 transition-all hover:-translate-y-0.5"
          >
            Mulai Cari Event <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </SectionContainer>
    </section>
  );
}

const categories = Object.entries(categoryMeta) as [
  keyof typeof categoryMeta,
  (typeof categoryMeta)[keyof typeof categoryMeta],
][];

// Hover warna emas untuk text-link
const textLinkClass =
  "group inline-flex items-center gap-1 text-sm font-semibold text-navy-900 transition hover:text-gold-600";

// ─────────────────────────────────────────────────────────────
// 1. KATEGORI (Dengan aksen gold pada hover & chip)
// ─────────────────────────────────────────────────────────────
export function LandingCategories() {
  return (
    <section id="kategori" className="scroll-mt-20 bg-white py-10 lg:py-14">
      <SectionContainer spacing="py-0">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="type-section text-navy-900">
              Lagi pengen nonton <span className="text-gold-500">apa?</span>
            </h2>
            <p className="body-copy mt-1.5 text-muted">
              Pilih kategorinya, sisanya biar kami yang urus.
            </p>
          </div>
          <Link href="/events" className={textLinkClass}>
            Semua kategori{" "}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categories.map(([value, meta]) => (
            <Link
              key={value}
              href={`/events?category=${value}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-canvas p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-navy-900 hover:bg-navy-900 hover:shadow-lg hover:shadow-navy-900/20"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white ring-2 ring-transparent transition-all duration-300 group-hover:bg-white/10 group-hover:ring-gold-400/40">
                <CategoryIcon
                  category={value}
                  className="h-6 w-6 text-navy-900 transition-colors duration-300 group-hover:text-gold-400"
                />
              </span>
              <span className="type-label text-navy-900 transition-colors duration-300 group-hover:text-white">
                {meta.label}
              </span>
            </Link>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. EVENT PILIHAN (Badge gold + hover gold)
// ─────────────────────────────────────────────────────────────
export function LandingFeatured({ events }: { events: EventWithStats[] }) {
  return (
    <section
      id="event"
      className="scroll-mt-20 border-y border-line bg-canvas py-10 lg:py-14"
    >
      <SectionContainer spacing="py-0">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge tone="gold" className="mb-3">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-gold-600" /> Pilihan
            </Badge>
            <h2 className="type-section text-navy-900">
              Event yang wajib kamu{" "}
              <span className="text-gold-500">datengin</span>
            </h2>
          </div>
          <Link href="/events" className={textLinkClass}>
            Lihat semua{" "}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <ButtonLink href="/events" size="lg" className="shadow-md">
            Jelajahi semua event{" "}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </SectionContainer>
    </section>
  );
}
