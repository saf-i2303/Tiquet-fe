import type { Metadata } from "next";
import { User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { logoutAction, updateProfileAction } from "@/lib/actions/auth.action";
import { requireAuth } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireAuth("/profile");
  const { saved, error } = await searchParams;

  return (
    <main>
      <PageHeader
        kicker="Akun"
        title="Profil saya"
        subtitle="Kelola data kontak supaya e-ticket dan notifikasi sampai ke kamu."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Perubahan profil berhasil disimpan.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-4">
          Nama minimal 2 karakter. Coba lagi.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5 text-center">
          <Avatar name={session.name} className="mx-auto h-16 w-16 text-xl" />
          <div className="type-subhead mt-3 text-navy-900">
            {session.name}
          </div>
          <div className="text-sm text-muted">{session.email}</div>
          <Badge tone="navy" className="mt-3">
            <User className="h-3 w-3" />
            {session.role === "super_admin"
              ? "Super Admin"
              : session.role === "organizer"
                ? "Organizer"
                : session.role === "gate_staff"
                  ? "Gate Staff"
                  : "Customer"}
          </Badge>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Data ini dipakai untuk penerbitan e-ticket dan notifikasi transaksi kamu.
          </p>
        </Card>

        <Card className="p-5">
          <CardHeader title="Informasi pribadi" />
          <form action={updateProfileAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="name">
              <Input id="name" name="name" defaultValue={session.name} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" value={session.email} disabled aria-describedby="email-hint" />
              <p id="email-hint" className="mt-1 text-xs text-muted">
                Email tidak bisa diubah untuk saat ini.
              </p>
            </Field>
            <Field label="Nomor WhatsApp" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                defaultValue={session.phone ?? ""}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
            <Field label="Kota" htmlFor="city">
              <Input
                id="city"
                name="city"
                defaultValue={session.city ?? ""}
                placeholder="Jakarta"
              />
            </Field>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">Simpan perubahan</Button>
            </div>
          </form>

          <div className="mt-6 border-t border-line pt-4">
            <h3 className="type-label text-navy-900">Keamanan akun</h3>
            <p className="mt-1 text-sm text-muted">
              Logout dari perangkat ini jika kamu memakai komputer bersama.
            </p>
            <form action={logoutAction} className="mt-3">
              <Button type="submit" variant="danger">
                Keluar dari akun
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
