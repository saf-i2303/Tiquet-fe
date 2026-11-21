"use client";

import { use, useMemo, useState, type FormEvent } from "react";
import { User } from "lucide-react";
import { LogoutForm } from "@/components/layout/logout-form";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserFromStorage, saveUserToStorage } from "@/lib/api";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import type { SessionUser } from "@/types/user";

type Role = NonNullable<SessionUser["role"]>;

const roleMeta: Record<
  Role,
  {
    label: string;
    subtitle: string;
    helper: string;
    hint: string;
  }
> = {
  customer: {
    label: "Customer",
    subtitle:
      "Kelola data kontak supaya e-ticket dan notifikasi sampai ke kamu.",
    helper:
      "Data ini dipakai untuk penerbitan e-ticket dan notifikasi transaksi kamu.",
    hint: "Email tidak bisa diubah untuk saat ini.",
  },
  organizer: {
    label: "Organizer",
    subtitle:
      "Kelola data kontak organizer untuk keperluan verifikasi dan komunikasi platform.",
    helper:
      "Data ini dipakai untuk verifikasi organizer dan komunikasi resmi platform.",
    hint: "Email tidak bisa diubah. Hubungi admin jika perlu perubahan.",
  },
  super_admin: {
    label: "Super Admin",
    subtitle: "Kelola data kontak akun administrator platform.",
    helper:
      "Data ini dipakai untuk keperluan audit dan komunikasi internal platform.",
    hint: "Email tidak bisa diubah. Perubahan memerlukan persetujuan internal.",
  },
  gate_staff: {
    label: "Gate Staff",
    subtitle: "Kelola data kontak petugas gate.",
    helper: "Data ini dipakai untuk koordinasi operasional di lokasi event.",
    hint: "Email tidak bisa diubah. Hubungi admin jika perlu perubahan.",
  },
};

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = use(searchParams);
  const { user, setUser } = useAuth();
  const session = useMemo(
    () =>
      user ??
      getUserFromStorage() ??
      (PREVIEW_MODE ? previewSession("customer") : null),
    [user],
  );
  const [savedLocally, setSavedLocally] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const role: Role = (session?.role as Role) ?? "customer";
  const meta = roleMeta[role];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) {
      setErrorMsg("Nama minimal 2 karakter. Coba lagi.");
      setSavedLocally(false);
      return;
    }

    if (session) {
      const updated: SessionUser = {
        ...session,
        name,
        phone: String(formData.get("phone") ?? "") || undefined,
        city: String(formData.get("city") ?? "") || undefined,
      };
      saveUserToStorage(updated);
      setUser(updated);
    }

    setErrorMsg("");
    setSavedLocally(true);
  }

  return (
    <main>
      <PageHeader kicker="Akun" title="Profil saya" subtitle={meta.subtitle} />

      {(saved || savedLocally) && (
        <Alert tone="success" className="mb-4">
          Perubahan profil berhasil disimpan.
        </Alert>
      )}
      {(error || errorMsg) && (
        <Alert tone="danger" className="mb-4">
          Nama minimal 2 karakter. Coba lagi.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5 text-center">
          <Avatar
            name={session?.name ?? ""}
            className="mx-auto h-16 w-16 text-xl"
          />
          <div className="type-subhead mt-3 text-navy-900">{session?.name}</div>
          <div className="text-sm text-muted">{session?.email}</div>
          <Badge tone="navy" className="mt-3">
            <User className="h-3 w-3" />
            {meta.label}
          </Badge>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {meta.helper}
          </p>
        </Card>

        <Card className="p-5">
          <CardHeader title="Informasi pribadi" />
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Nama lengkap" htmlFor="name">
              <Input id="name" name="name" defaultValue={session?.name ?? ""} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                value={session?.email ?? ""}
                disabled
                aria-describedby="email-hint"
              />
              <p id="email-hint" className="mt-1 text-xs text-muted">
                {meta.hint}
              </p>
            </Field>
            <Field label="Nomor WhatsApp" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                defaultValue={session?.phone ?? ""}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
            <Field label="Kota" htmlFor="city">
              <Input
                id="city"
                name="city"
                defaultValue={session?.city ?? ""}
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
            <LogoutForm className="mt-3">
              <Button type="submit" variant="danger">
                Keluar dari akun
              </Button>
            </LogoutForm>
          </div>
        </Card>
      </div>
    </main>
  );
}
