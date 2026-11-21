"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryRow } from "@/components/ui/summary-row";
import { organizerStatusMeta } from "@/lib/constants";
import { requireOrganizerId } from "@/lib/ownership";
import { formatDate } from "@/lib/utils";
import {
  getOrganizer,
  updateOrganizerProfile,
} from "@/services/organizerServices";
import type { Organizer } from "@/types/organizer";

export default function OrganizerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [savedLocally, setSavedLocally] = useState(false);
  const [requiredError, setRequiredError] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    getOrganizer(organizerId)
      .then((data) => {
        if (active) setOrganizer(data);
      })
      .catch(() => {
        if (active) setOrganizer(undefined);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user || isDataLoading) return null;

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name || !email) {
      setRequiredError(true);
      window.alert("Nama dan email wajib diisi.");
      return;
    }

    try {
      await updateOrganizerProfile({
        name,
        description: String(data.get("description") ?? ""),
        contact_email: email,
        contact_phone: String(data.get("phone") ?? ""),
      });
      setRequiredError(false);
      setSavedLocally(true);
      setOrganizer((current) =>
        current
          ? {
              ...current,
              name,
              email,
              phone: String(data.get("phone") ?? ""),
              description: String(data.get("description") ?? ""),
            }
          : current,
      );
      router.refresh();
    } catch (submitError) {
      window.alert(
        submitError instanceof Error ? submitError.message : "Gagal menyimpan profil organizer.",
      );
    }
  }

  if (!organizer) {
    return <Alert tone="danger">Data organizer tidak ditemukan.</Alert>;
  }

  return (
    <main>
      <PageHeader
        kicker="Pengaturan"
        title="Profil organizer"
        subtitle="Informasi ini tampil di halaman event dan membantu peserta mengenal EO kamu."
      />

      {(saved || savedLocally) && (
        <Alert tone="success" className="mb-5">
          Profil organizer berhasil diperbarui.
        </Alert>
      )}
      {(error || requiredError) && (
        <Alert tone="danger" className="mb-5">
          Nama dan email wajib diisi.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama organizer" htmlFor="name">
                <Input id="name" name="name" required defaultValue={organizer.name} />
              </Field>
              <Field label="Email resmi" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={organizer.email}
                />
              </Field>
              <Field label="Nomor telepon" htmlFor="phone">
                <Input id="phone" name="phone" defaultValue={organizer.phone} />
              </Field>
              <Field label="Kota domisili" htmlFor="city">
                <Input id="city" name="city" defaultValue={organizer.city} />
              </Field>
            </div>
            <Field label="Tentang organizer" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={organizer.description}
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" variant="navy">
                Simpan profil
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit p-5">
          <CardHeader title="Status akun" />
          <div className="mt-2">
            <StatusBadge value={organizer.status} map={organizerStatusMeta} />
          </div>
          <div className="mt-4 space-y-2">
            <SummaryRow label="Bergabung">{formatDate(organizer.joinedAt)}</SummaryRow>
            {organizer.verifiedAt && (
              <SummaryRow label="Terverifikasi">
                {formatDate(organizer.verifiedAt)}
              </SummaryRow>
            )}
            <SummaryRow label="Total event">{organizer.events}</SummaryRow>
          </div>
          <p className="body-copy mt-4 text-xs text-muted">
            Perubahan nama organizer akan tercermin pada event yang belum tayang. Event yang
            sudah tayang mengikuti nama saat publikasi.
          </p>
        </Card>
      </div>
    </main>
  );
}
