import type { Metadata } from "next";
import {
  BadgePercent,
  CalendarClock,
  Headphones,
  Mail,
  Save,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryRow } from "@/components/ui/summary-row";
import { saveSettingsAction } from "@/lib/actions/admin.action";
import { requireRole } from "@/lib/guards";
import { platformSettings } from "@/lib/mocks/settings";

export const metadata: Metadata = {
  title: "Kebijakan Platform",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("super_admin", "/admin/settings");
  const { saved } = await searchParams;
  const settings = platformSettings;

  return (
    <main>
      <PageHeader
        kicker="Pengaturan platform"
        title="Kebijakan & pengaturan"
        subtitle="Atur biaya layanan, moderasi, pencairan, dan kanal dukungan pengguna."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Pengaturan platform berhasil disimpan dan langsung berlaku.
        </Alert>
      )}

      <form action={saveSettingsAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <BadgePercent className="h-4 w-4 text-navy-600" /> Biaya &amp; pembatasan
                </span>
              }
              description="Berlaku untuk seluruh transaksi baru di platform."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Biaya layanan per transaksi (Rp)"
                htmlFor="serviceFee"
                hint="Ditambahkan ke total pembayaran pembeli."
              >
                <Input
                  id="serviceFee"
                  name="serviceFee"
                  type="number"
                  min={0}
                  step={1000}
                  defaultValue={settings.serviceFee}
                  required
                />
              </Field>
              <Field
                label="Maksimal tiket per transaksi"
                htmlFor="maxTicketsPerOrder"
                hint="Batas atas pembelian dalam satu order."
              >
                <Input
                  id="maxTicketsPerOrder"
                  name="maxTicketsPerOrder"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={settings.maxTicketsPerOrder}
                  required
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-navy-600" /> Pencairan dana
                </span>
              }
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                label="Jadwal pencairan dana organizer"
                htmlFor="payoutSchedule"
                hint="Jadwal otomatis untuk pencairan yang telah disetujui."
              >
                <Select
                  id="payoutSchedule"
                  name="payoutSchedule"
                  defaultValue={settings.payoutSchedule}
                >
                  {[
                    "Harian (setiap hari kerja)",
                    "Mingguan (setiap Selasa)",
                    "Dua mingguan",
                    "Bulanan (tanggal 1)",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-navy-600" /> Moderasi &amp; verifikasi
                </span>
              }
            />
            <div className="mt-3 space-y-3">
              <div className="rounded-control border border-line p-3">
                <Field
                  label="Moderasi event wajib"
                  htmlFor="eventModeration"
                  hint="Event baru harus disetujui super admin sebelum tayang di marketplace."
                >
                  <Checkbox
                    id="eventModeration"
                    name="eventModeration"
                    defaultChecked={settings.eventModeration}
                  />
                </Field>
              </div>
              <div className="rounded-control border border-line p-3">
                <Field
                  label="Setujui organizer otomatis"
                  htmlFor="autoApproveOrganizer"
                  hint="Organizer baru langsung terverifikasi tanpa review dokumen manual."
                >
                  <Checkbox
                    id="autoApproveOrganizer"
                    name="autoApproveOrganizer"
                    defaultChecked={settings.autoApproveOrganizer}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-navy-600" /> Kanal dukungan
                </span>
              }
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Email dukungan" htmlFor="supportEmail">
                <Input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  defaultValue={settings.supportEmail}
                  required
                />
              </Field>
              <Field label="Nomor telepon dukungan" htmlFor="supportPhone">
                <Input
                  id="supportPhone"
                  name="supportPhone"
                  type="tel"
                  defaultValue={settings.supportPhone}
                  required
                />
              </Field>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4" /> Simpan pengaturan
            </Button>
          </div>
        </div>

        <aside className="h-fit section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-navy-600" /> Ringkasan saat ini
                </span>
              }
            />
            <div className="mt-3 space-y-2">
              <SummaryRow label="Biaya layanan">
                Rp{settings.serviceFee.toLocaleString("id-ID")}
              </SummaryRow>
              <SummaryRow label="Maks. tiket/order">{settings.maxTicketsPerOrder}</SummaryRow>
              <SummaryRow label="Pencairan">{settings.payoutSchedule}</SummaryRow>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-navy-600" /> Dukungan pengguna
                </span>
              }
            />
            <div className="mt-3 space-y-2">
              <SummaryRow label="Email">
                <span className="block max-w-[11rem] truncate">{settings.supportEmail}</span>
              </SummaryRow>
              <SummaryRow label="Telepon">{settings.supportPhone}</SummaryRow>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-navy-600" /> Catatan
                </span>
              }
            />
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li>Perubahan biaya layanan tidak memengaruhi order yang sudah lunas.</li>
              <li>Menonaktifkan moderasi membuat event langsung tayang setelah diajukan.</li>
              <li>Pastikan data dukungan selalu aktif agar pembeli bisa menghubungi tim.</li>
            </ul>
          </Card>
        </aside>
      </form>
    </main>
  );
}
