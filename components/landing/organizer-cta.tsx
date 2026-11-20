import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Ticket,
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { SectionContainer } from "@/components/ui/section-container";

const benefits = [
  "Dashboard penjualan real-time",
  "Pencairan dana terjadwal dan transparan",
  "Kelola tim dan petugas gate",
  "Tanpa biaya setup atau kontrak",
];

export function LandingOrganizerCta() {
  return (
    <section
      id="organizer"
      className="scroll-mt-20 overflow-hidden bg-white py-16 lg:py-24"
    >
      <SectionContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ───────────── SISI KIRI (Konten) ───────────── */}
          <div>
            {/* Eyebrow dengan aksen emas */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
              </span>
              Untuk Event Organizer
            </div>

            <h2 className="type-section mt-6 text-navy-900">
              Kelola penjualan tiket dari{" "}
              <span className="text-gold-500">satu dashboard.</span>
            </h2>

            <p className="body-copy-lg mt-4 text-muted">
              Fokus pada acaramu, biarkan kami yang mengurus penjualan, data
              pengunjung, dan laporan keuanganmu secara otomatis.
            </p>

            {/* List Keuntungan dengan Ikon Cek Emas */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100">
                    <CheckCircle2 className="h-4 w-4 text-gold-600" />
                  </div>
                  <span className="body-copy font-medium text-navy-800">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/register"
                size="lg"
                className="shadow-lg shadow-navy-900/20"
              >
                Daftar sebagai EO{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/organizer" variant="outline" size="lg">
                Lihat Demo Dashboard
              </ButtonLink>
            </div>
          </div>

          {/* ───────────── SISI KANAN (Mockup Dashboard) ───────────── */}
          <div className="relative">
            {/* Dekorasi Background (Bayangan & Aksen) */}
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-canvas transform rotate-2" />
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] border border-line" />

            {/* Jendela Dashboard */}
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
              {/* Window Bar */}
              <div className="flex h-10 items-center gap-2 border-b border-line bg-canvas px-4">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-danger/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/80" />
                </div>
                <div className="mx-auto flex h-6 w-1/2 items-center justify-center rounded-md bg-white text-[10px] text-muted shadow-sm">
                  app.tiquet.id/dashboard
                </div>
              </div>

              {/* Body Dashboard */}
              <div className="flex h-[380px]">
                {/* Sidebar Mockup */}
                <div className="w-16 border-r border-line bg-canvas py-4 flex flex-col items-center gap-4">
                  <LayoutDashboard className="h-5 w-5 text-navy-900" />
                  <Ticket className="h-5 w-5 text-muted" />
                  <Users className="h-5 w-5 text-muted" />
                  <div className="mt-auto">
                    <Settings className="h-5 w-5 text-muted" />
                  </div>
                </div>

                {/* Konten Mockup */}
                <div className="flex-1 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-navy-900">
                        Ringkasan Event
                      </h4>
                      <p className="text-xs text-muted">
                        Neon Nights Festival 2026
                      </p>
                    </div>
                    <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
                      Aktif
                    </span>
                  </div>

                  {/* Stat Cards */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line p-3">
                      <p className="text-[10px] font-medium text-muted">
                        Pendapatan
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <Price
                          value={48_250_000}
                          className="text-base font-bold text-navy-900"
                        />
                      </div>
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                        <TrendingUp className="h-3 w-3" /> +18%
                      </span>
                    </div>
                    <div className="rounded-xl border border-line p-3">
                      <p className="text-[10px] font-medium text-muted">
                        Tiket Terjual
                      </p>
                      <p className="mt-1 text-base font-bold text-navy-900">
                        3.420
                      </p>
                      <span className="text-[10px] text-muted">
                        dari 4.000 kuota
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 rounded-xl border border-line p-3">
                    <Progress
                      value={3_420}
                      total={4_000}
                      label="Kapasitas Venue"
                    />
                  </div>

                  {/* Fake Chart (Bar Chart Sederhana) */}
                  <div className="mt-5">
                    <p className="text-[10px] font-medium text-muted mb-2">
                      Penjualan 7 Hari Terakhir
                    </p>
                    <div className="flex h-16 items-end gap-1.5">
                      {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t-sm bg-gold-400/80 transition-all hover:bg-gold-500"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
