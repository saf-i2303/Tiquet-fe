import {
  Banknote,
  MousePointerClick,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Search,
  Ticket,
  ScanLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionContainer } from "@/components/ui/section-container";

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
// 1. STATS SECTION (Lebih Rapat)
// ─────────────────────────────────────────────────────────────
export function LandingStats() {
  return (
    // -mt-10 agar menyatu dengan Hero, pb-4 agar tidak terlalu jauh ke bawah
    <section className="relative z-10 -mt-10 bg-transparent pb-4">
      <SectionContainer spacing="py-0">
        <Card className="grid grid-cols-2 gap-px overflow-hidden border-line bg-line sm:grid-cols-4 shadow-lg shadow-navy-900/5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center bg-white p-5 text-center transition-colors hover:bg-canvas sm:p-6"
            >
              <span className="text-3xl font-black tracking-tight text-navy-900 sm:text-4xl">
                {stat.value}
              </span>
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
// 2. PILLARS SECTION (Padding Dikurangi 50%)
// ─────────────────────────────────────────────────────────────
export function LandingPillars() {
  return (
    // Ubah py-16 lg:py-24 menjadi py-10 lg:py-14
    <section id="keunggulan" className="scroll-mt-20 bg-white py-10 lg:py-14">
      <SectionContainer>
        {/* Kurangi mb-12 menjadi mb-8 */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Badge tone="gold" className="mb-3">
            Keunggulan Utama
          </Badge>
          <h2 className="type-section text-navy-900">
            Kenapa anak muda pindah ke sini?
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
              className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-navy-900/20 hover:shadow-lg"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />

              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/5 transition-colors group-hover:bg-gold-100">
                  <Icon
                    className="h-5 w-5 text-navy-900 transition-colors group-hover:text-gold-600"
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
                <h3 className="type-subhead mt-4 text-navy-900">{title}</h3>
                <p className="body-copy mt-1.5 text-muted text-[13px] leading-relaxed">
                  {desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. STEPS SECTION (Lebih Rapat & Padat)
// ─────────────────────────────────────────────────────────────
export function LandingSteps() {
  return (
    // Ubah py-16 lg:py-24 menjadi py-10 lg:py-14
    <section
      id="cara-kerja"
      className="scroll-mt-20 overflow-hidden bg-canvas py-10 lg:py-14"
    >
      <SectionContainer>
        {/* Kurangi mb-16 menjadi mb-10 */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Badge
            tone="navy"
            className="mb-3 bg-white text-navy-900 border-line"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 text-gold-500" /> Cuma 3
            Langkah
          </Badge>
          <h2 className="type-section text-navy-900">
            Dari scroll ke gate venue
          </h2>
          <p className="body-copy mt-2 text-muted">
            Tanpa drama, tanpa langkah yang tidak perlu.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[15%] right-[15%] top-8 hidden h-px border-t-2 border-dashed border-navy-900/10 md:block" />

          {steps.map((step) => (
            <div
              key={step.n}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center">
                <span className="absolute text-6xl font-black text-navy-900/5 select-none">
                  {step.n}
                </span>
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white shadow-sm">
                  <step.Icon className="h-5 w-5 text-navy-900" />
                </div>
              </div>

              <h3 className="type-subhead text-navy-900">{step.title}</h3>
              <p className="body-copy mt-1.5 max-w-[250px] text-[13px] text-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Kurangi mt-16 menjadi mt-10 */}
        <div className="mt-10 flex justify-center">
          <ButtonLink
            href="/events"
            size="lg"
            className="shadow-md shadow-navy-900/10"
          >
            Mulai Cari Event <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </SectionContainer>
    </section>
  );
}
