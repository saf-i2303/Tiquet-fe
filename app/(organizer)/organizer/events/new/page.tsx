import type { Metadata } from "next";
import { Lightbulb, ShieldCheck } from "lucide-react";
import { EventForm } from "@/components/organizer/event-form";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Buat Event Baru",
};

const tips = [
  "Gunakan nama event yang jelas dan mudah dicari pembeli.",
  "Pilih kategori yang paling relevan agar event muncul di filter yang tepat.",
  "Tulis deskripsi yang menarik: lineup, agenda, dan benefit peserta.",
  "Setelah event dibuat, tambahkan kategori tiket sebelum mengajukan moderasi.",
];

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("organizer", "/organizer/events/new");
  const { error } = await searchParams;

  return (
    <main>
      <BackLink href="/organizer/events" label="Kembali ke daftar event" />

      <PageHeader
        kicker="Event baru"
        title="Buat event baru"
        subtitle="Isi informasi dasar event. Kamu bisa menambahkan kategori tiket setelahnya."
        className="mt-4"
      />

      {error === "required" && (
        <Alert tone="danger" className="mb-5">
          Nama event, venue, dan tanggal wajib diisi. Periksa kembali form di bawah.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <EventForm />

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-navy-600" /> Tips bikin event
                </span>
              }
            />
            <ul className="mt-3 space-y-2 text-sm text-navy-800">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted" /> Alur moderasi
                </span>
              }
            />
            <ol className="mt-3 space-y-2 text-sm text-navy-800">
              <li>1. Simpan event sebagai draft.</li>
              <li>2. Tambahkan kategori &amp; kuota tiket.</li>
              <li>3. Ajukan moderasi ke super admin.</li>
              <li>4. Event tayang dan siap dijual.</li>
            </ol>
          </Card>
        </aside>
      </div>
    </main>
  );
}
