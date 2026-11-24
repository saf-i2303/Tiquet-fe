"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";
import { BadgeCheck, ScanLine, ShieldCheck, User } from "lucide-react";
import { ProfileInsights } from "@/components/profile/profile-insights";
import { LogoutForm } from "@/components/layout/logout-form";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { SummaryRow } from "@/components/ui/summary-row";
import { useAuth } from "@/components/providers/auth-provider";
import { roleMeta as roleBadgeMeta } from "@/lib/constants";
import { getUserFromStorage, saveUserToStorage } from "@/lib/api";
import { PREVIEW_MODE, previewSession } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { fetchAccountRecord } from "@/services/profileServices";
import type { Role, SessionUser } from "@/types/user";

type RoleCopy = {
  title: string;
  subtitle: string;
  helper: string;
  hint: string;
  accent: string;
  avatar: string;
  hero: string;
  icon: ComponentType<{ className?: string }>;
};

/**
 * Copy + aksen visual untuk profil akun tiap role.
 * `role` sengaja datang dari halaman (bukan dari sesi) supaya styling
 * dan konten mengikuti route yang dibuka.
 */
const roleCopy: Record<Role, RoleCopy> = {
  customer: {
    title: "Profil saya",
    subtitle: "Kelola data kontak supaya e-ticket dan notifikasi sampai ke kamu.",
    helper:
      "Data ini dipakai untuk penerbitan e-ticket dan notifikasi transaksi kamu.",
    hint: "Email tidak bisa diubah untuk saat ini.",
    accent: "bg-gold-400",
    avatar: "bg-gold-400 text-navy-950",
    hero: "from-navy-950 via-navy-900 to-blue-500/25",
    icon: User,
  },
  organizer: {
    title: "Profil akun organizer",
    subtitle:
      "Kelola data kontak organizer untuk keperluan verifikasi dan komunikasi platform.",
    helper:
      "Data ini dipakai untuk verifikasi organizer dan komunikasi resmi platform.",
    hint: "Email tidak bisa diubah. Hubungi admin jika perlu perubahan.",
    accent: "bg-gold-300",
    avatar: "bg-gold-300 text-navy-950",
    hero: "from-navy-950 via-navy-900 to-gold-500/20",
    icon: BadgeCheck,
  },
  gate_staff: {
    title: "Profil petugas gate",
    subtitle: "Kelola data kontak petugas gate.",
    helper: "Data ini dipakai untuk koordinasi operasional di lokasi event.",
    hint: "Email tidak bisa diubah. Hubungi admin jika perlu perubahan.",
    accent: "bg-info",
    avatar: "bg-info text-white",
    hero: "from-navy-950 via-navy-800 to-blue-500/25",
    icon: ScanLine,
  },
  super_admin: {
    title: "Profil administrator",
    subtitle: "Kelola data kontak akun administrator platform.",
    helper:
      "Data ini dipakai untuk keperluan audit dan komunikasi internal platform.",
    hint: "Email tidak bisa diubah. Perubahan memerlukan persetujuan internal.",
    accent: "bg-blue-400",
    avatar: "bg-navy-700 text-gold-300",
    hero: "from-navy-950 via-navy-900 to-blue-400/25",
    icon: ShieldCheck,
  },
};

/**
 * Profil akun reusable untuk semua role. Halaman tiap role tinggal memanggil
 * komponen ini dengan `role` dan meneruskan query `saved`/`error`.
 */
export function AccountProfile({
  role,
  saved,
  error,
}: {
  role: Role;
  saved?: string;
  error?: string;
}) {
  const { user, setUser } = useAuth();
  const session = useMemo(
    () =>
      user ??
      getUserFromStorage() ??
      (PREVIEW_MODE ? previewSession(role) : null),
    [user, role],
  );
  const copy = roleCopy[role];
  const badgeMeta = roleBadgeMeta[role] ?? {
    label: role,
    tone: "slate" as const,
  };
  const RoleIcon = copy.icon;
  const [savedLocally, setSavedLocally] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [dataSource, setDataSource] = useState<"database" | "local">("local");

  // Ref menjaga effect tidak mengulang fetch setelah setUser memicu render ulang.
  const refreshedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!session || PREVIEW_MODE || refreshedFor.current === session.id) return;
    refreshedFor.current = session.id;

    let active = true;
    void (async () => {
      const record = await fetchAccountRecord(session);
      if (!active || !record) return;
      saveUserToStorage(record.user);
      setUser(record.user);
      setDataSource("database");
    })();

    return () => {
      active = false;
    };
  }, [session, setUser]);

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

  const shortId = session?.id ? `${session.id.slice(0, 8)}…` : "-";

  return (
    <main className="space-y-6">
      <section
        className={cn(
          "relative overflow-hidden rounded-card bg-gradient-to-br p-6 text-white shadow-card sm:p-8",
          copy.hero,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-2 text-gold-300">
              <span className={cn("h-1.5 w-1.5 rounded-full", copy.accent)} />
              Akun {badgeMeta.label}
            </p>
            <h1 className="type-page mt-2 text-white">{copy.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {copy.subtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                tone="gold"
                className="border-white/20 bg-white/10 text-gold-300"
              >
                <RoleIcon className="h-3 w-3" aria-hidden="true" />
                {badgeMeta.label}
              </Badge>
              <Badge
                tone="navy"
                className="border-white/20 bg-white/5 text-white"
              >
                {dataSource === "database" ? "Data database" : "Data perangkat"}
              </Badge>
            </div>
          </div>

          <div className="flex min-w-[16rem] items-center gap-4 rounded-control border border-white/15 bg-white/10 p-4 backdrop-blur">
            <Avatar
              name={session?.name ?? ""}
              className={cn("h-14 w-14 text-lg ring-2 ring-gold-300/70", copy.avatar)}
            />
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">
                {session?.name ?? "Tamu"}
              </div>
              <div className="truncate text-xs text-white/70">
                {session?.email ?? "Belum masuk"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {PREVIEW_MODE && (
        <Alert tone="info">
          Mode preview aktif: data akun memakai sesi contoh dan ringkasan tidak
          memanggil API.
        </Alert>
      )}
      {(saved || savedLocally) && (
        <Alert tone="success">Perubahan profil berhasil disimpan.</Alert>
      )}
      {(error || errorMsg) && (
        <Alert tone="danger">Nama minimal 2 karakter. Coba lagi.</Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit overflow-hidden border-gold-300/60 p-0">
          <div className="h-1.5 bg-gradient-to-r from-gold-400 via-gold-300 to-blue-400" />
          <div className="space-y-5 p-5">
            <div className="text-center">
              <Avatar
                name={session?.name ?? ""}
                className={cn("mx-auto h-16 w-16 text-xl", copy.avatar)}
              />
              <div className="type-subhead mt-3 text-navy-900">
                {session?.name}
              </div>
              <div className="text-sm text-muted">{session?.email}</div>
              <Badge tone={badgeMeta.tone} className="mt-3">
                <RoleIcon className="h-3 w-3" aria-hidden="true" />
                {badgeMeta.label}
              </Badge>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {copy.helper}
              </p>
            </div>

            <div className="space-y-3 border-t border-line pt-4">
              <p className="eyebrow text-gold-600">Identitas akun</p>
              <SummaryRow label="ID akun">
                <span className="font-mono text-xs">{shortId}</span>
              </SummaryRow>
              <SummaryRow label="Email">{session?.email ?? "-"}</SummaryRow>
              <SummaryRow label="Role">{badgeMeta.label}</SummaryRow>
              <SummaryRow label="Sumber data">
                {dataSource === "database" ? "Database" : "Perangkat"}
              </SummaryRow>
            </div>

            <div className="rounded-control border border-info/20 bg-info-soft p-3 text-xs leading-relaxed text-info">
              Nomor WhatsApp dan kota disimpan di perangkat karena tabel users
              belum menyediakan kolom tersebut.
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-gold-600">Profil</p>
              <CardHeader title="Informasi pribadi" className="mb-0 mt-1" />
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-navy-900 text-gold-300">
              <User className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Nama lengkap" htmlFor="name">
              <Input
                id="name"
                name="name"
                autoComplete="name"
                defaultValue={session?.name ?? ""}
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                value={session?.email ?? ""}
                disabled
                aria-describedby="email-hint"
              />
              <p id="email-hint" className="mt-1 text-xs text-muted">
                {copy.hint}
              </p>
            </Field>
            <Field label="Nomor WhatsApp" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={session?.phone ?? ""}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
            <Field label="Kota" htmlFor="city">
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                defaultValue={session?.city ?? ""}
                placeholder="Jakarta"
              />
            </Field>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">Simpan perubahan</Button>
            </div>
          </form>

          <div className="mt-6 rounded-control border border-line bg-canvas/60 p-4">
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

      <ProfileInsights
        key={role}
        role={role}
        staffId={session?.id}
        organizerId={session?.organizerId}
      />
    </main>
  );
}
