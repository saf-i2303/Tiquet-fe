import { ArrowRight, Plus, Star, CheckCircle2, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionContainer } from "@/components/ui/section-container";

// ─────────────────────────────────────────────────────────────
// 1. DATA DUMMY UTAMA
// ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    id: 1,
    name: "Andi",
    role: "Pengunjung event",
    quote:
      "Proses checkout cepat dan e-ticket langsung tersedia. Pengalaman belinya rapi dari awal sampai masuk venue.",
  },
  {
    id: 2,
    name: "Sari",
    role: "Event Organizer",
    quote:
      "Dashboard penjualan dan peserta mudah dipantau. Tim kami jadi lebih fokus menyiapkan jalannya acara.",
  },
  {
    id: 3,
    name: "Budi",
    role: "Penonton reguler",
    quote:
      "Informasi event jelas, pembayaran aman, dan tiket tersimpan rapi di akun. Praktis dipakai kapan saja.",
  },
  {
    id: 4,
    name: "Rina",
    role: "Pengunjung event",
    quote:
      "Fitur refund-nya transparan. Sempat batal nonton karena sakit, dananya kembali sesuai estimasi. Sangat profesional.",
  },
  {
    id: 5,
    name: "Dimas",
    role: "Event Organizer",
    quote:
      "Sangat membantu untuk scaling event. Fitur scan QR di gate benar-benar mempercepat antrean pengunjung.",
  },
];

const faqs = [
  {
    q: "Apakah tiket yang dijual resmi?",
    a: "Ya. Tiket diterbitkan oleh organizer yang telah melalui proses verifikasi di platform.",
  },
  {
    q: "E-ticket dikirim ke mana?",
    a: "E-ticket tersedia di akun Anda pada menu Tiket Saya setelah pembayaran dikonfirmasi.",
  },
  {
    q: "Bagaimana cara memantau status pesanan?",
    a: "Status pembayaran dan detail pesanan dapat dilihat kapan saja melalui menu Riwayat Transaksi.",
  },
  {
    q: "Bagaimana cara menjual tiket event?",
    a: "Daftar sebagai Event Organizer, lengkapi verifikasi, buat event, lalu kelola penjualan dari dashboard.",
  },
];

// ─────────────────────────────────────────────────────────────
// 2. TESTIMONIAL CAROUSEL (FIXED STRUCTURE & STYLING)
// ─────────────────────────────────────────────────────────────
export function LandingTestimonials() {
  return (
    <section className="overflow-hidden bg-canvas py-16 lg:py-24">
      <SectionContainer spacing="py-0">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {/* Social Proof: Avatar Stack + Rating Bintang */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex -space-x-3">
              <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white ring-2 ring-canvas">
                A
              </div>
              <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-900 ring-2 ring-canvas">
                S
              </div>
              <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white ring-2 ring-canvas">
                B
              </div>
              <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-navy-900 shadow-sm ring-2 ring-canvas">
                +10k
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-navy-900">4.9/5</span>
            </div>
          </div>

          {/* Judul Ekspresif */}
          <h2 className="type-section mt-6 text-navy-900">
            Kata mereka yang udah{" "}
            <span className="italic text-gold-500">nonton bareng.</span>
          </h2>

          <p className="body-copy mt-3 text-muted">
            Bukan cuma kata kami — ini pengalaman asli dari pembeli dan event
            organizer.
          </p>
        </div>
      </SectionContainer>

      {/* ───────────── AREA CAROUSEL ───────────── */}
      <div className="relative flex w-full overflow-hidden">
        {/* Gradient Overlay Kiri & Kanan */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent sm:w-32" />

        {/* 
          Marquee menggunakan class global `tiquet-trust-marquee` 
          Duplikasi grup [0, 1] agar loop sempurna dan `aria-hidden` untuk aksesibilitas.
        */}
        <div className="tiquet-trust-marquee flex w-max shrink-0 items-center">
          {[0, 1].map((group) => (
            <div
              key={group}
              className="flex shrink-0 items-center gap-4 pr-4 lg:gap-6 lg:pr-6"
              aria-hidden={group === 1}
            >
              {testimonials.map((testimonial) => (
                <Card
                  key={`${group}-${testimonial.id}`}
                  className="group w-[300px] shrink-0 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-lg hover:shadow-gold-500/10 sm:w-[350px]"
                >
                  <div
                    className="flex gap-0.5 text-gold-500"
                    aria-label="5 dari 5 bintang"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-current"
                        strokeWidth={0}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="body-copy mt-4 line-clamp-4 text-navy-800">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar name={testimonial.name} />
                    <div className="min-w-0">
                      <div className="type-label truncate text-navy-900">
                        {testimonial.name}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. FAQ
// ─────────────────────────────────────────────────────────────
export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-surface">
      <SectionContainer spacing="py-16 lg:py-24">
        {/* Gunakan Grid 12 Kolom untuk Layout Kiri-Kanan */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* SISI KIRI: Judul & Info Tambahan (Sticky di Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <Badge tone="gold" className="mb-4">
              Pusat Bantuan
            </Badge>
            <h2 className="type-section text-navy-900">
              Masih ragu atau punya pertanyaan?
            </h2>
            <p className="body-copy mt-4 text-muted">
              Kami mengumpulkan pertanyaan yang paling sering ditanyakan oleh
              pengunjung dan organizer. Kalau masih bingung, tim CS kami siap
              membantu.
            </p>
            <ButtonLink href="/contact" variant="outline" className="mt-6">
              Hubungi Support <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>

          {/* SISI KANAN: Daftar Accordion */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-line bg-white transition-all duration-300 open:border-navy-900/20 open:bg-canvas/50 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
                    <span className="text-base font-bold text-navy-900 sm:text-lg">
                      {faq.q}
                    </span>
                    {/* Tombol Plus yang berubah menjadi X (rotasi 45deg) dan berubah warna */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-navy-900 transition-colors duration-300 group-open:bg-navy-900 group-open:text-white">
                      <Plus
                        className="h-4 w-4 transition-transform duration-300 group-open:rotate-45"
                        aria-hidden
                      />
                    </div>
                  </summary>

                  {/* Area Jawaban */}
                  <div className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                    <div className="h-px w-full bg-line/60 mb-4" />
                    <p className="body-copy text-navy-800 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. FINAL CTA
// ─────────────────────────────────────────────────────────────
export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-16 text-white lg:py-20">
      {/* ───────────── Background Glow Effects ───────────── */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        {/* Pendaran Emas di Kiri */}
        <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-gold-500/20 blur-[120px]" />
        {/* Pendaran Biru di Kanan */}
        <div className="absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
        {/* Vignette Halus di Tengah */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--color-navy-900)_80%,transparent)_100%)]" />
      </div>

      <SectionContainer spacing="py-0 relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Badge Atas */}
          <Badge
            tone="glass"
            className="mb-6 border-white/20 bg-white/10 px-4 py-1.5 text-white backdrop-blur-md"
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-gold-300" />
            Mulai Langkah Pertamamu
          </Badge>

          {/* Judul Utama */}
          <h2 className="type-section text-white lg:text-5xl">
            Siap menemukan{" "}
            <span className="text-gold-300">event berikutnya?</span>
          </h2>

          {/* Sub-deskripsi */}
          <p className="body-copy-lg mt-4 max-w-xl text-white/70">
            Buat akun gratis dalam hitungan detik. Jelajahi ribuan event,
            amankan tiketmu, dan bersiaplah untuk pengalaman yang tak
            terlupakan.
          </p>

          {/* Tombol Aksi */}
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <ButtonLink
              href="/events"
              size="lg"
              className="bg-white text-navy-900 shadow-xl shadow-white/10 hover:bg-white/90"
            >
              Cari Event Sekarang{" "}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/register"
              variant="popGhost"
              size="lg"
              className="border-white/20 hover:bg-white/10"
            >
              Buat Akun Gratis
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-gold-300" /> Gratis untuk
              pembeli
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-gold-300" /> Tanpa kartu
              kredit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-gold-300" /> Checkout 60
              detik
            </span>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
