"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { notFound, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryRow } from "@/components/ui/summary-row";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import {
  deleteVenue,
  getVenue,
  updateVenue,
  type VenueRecord,
} from "@/services/venueServices";

export default function OrganizerVenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [venue, setVenue] = useState<VenueRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [missing, setMissing] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getVenue(id)
      .then((data) => {
        if (!active) return;
        setVenue(data);
        setErrorMsg("");
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setMissing(true);
          return;
        }
        setErrorMsg(getApiErrorMessage(error, "Gagal memuat data venue."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (missing) notFound();

  async function handleUpdate(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const capacityRaw = String(formData.get("capacity") ?? "").trim();
    const capacity = capacityRaw ? Number(capacityRaw) : undefined;

    if (!name || !address || !city) {
      setErrorMsg("Nama, alamat, dan kota wajib diisi.");
      return;
    }
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity <= 0)) {
      setErrorMsg("Kapasitas harus berupa bilangan bulat positif.");
      return;
    }

    try {
      const updated = await updateVenue(id, {
        name,
        address,
        city,
        ...(capacity !== undefined ? { capacity } : {}),
      });
      setVenue(updated);
      setSavedLocally(true);
      setErrorMsg("");
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menyimpan perubahan venue."));
    }
  }

  async function handleDelete() {
    if (!window.confirm("Hapus venue ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setIsDeleting(true);
    setErrorMsg("");
    try {
      await deleteVenue(id);
      router.push("/organizer/venues");
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menghapus venue."));
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <Alert tone="info" className="mb-4">Memuat venue...</Alert>
      </main>
    );
  }
  if (!venue) {
    return (
      <main>
        <Alert tone="danger" className="mb-4">
          {errorMsg || "Data venue tidak ditemukan."}
        </Alert>
      </main>
    );
  }

  return (
    <main>
      <BackLink href="/organizer/venues" label="Kembali ke daftar venue" />

      <PageHeader
        kicker="Lokasi acara"
        title={venue.name}
        subtitle="Perbarui informasi lokasi atau hapus venue ini."
        className="mt-4"
      />

      {savedLocally && (
        <Alert tone="success" className="mb-5">Perubahan venue berhasil disimpan.</Alert>
      )}
      {errorMsg && (
        <Alert tone="danger" className="mb-5">{errorMsg}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <CardHeader title="Informasi venue" />
          <form onSubmit={handleUpdate} className="mt-3 space-y-4">
            <Field label="Nama venue" htmlFor="edit-venue-name">
              <Input id="edit-venue-name" name="name" required defaultValue={venue.name} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kota" htmlFor="edit-venue-city">
                <Input id="edit-venue-city" name="city" required defaultValue={venue.city} />
              </Field>
              <Field label="Kapasitas" htmlFor="edit-venue-capacity">
                <Input
                  id="edit-venue-capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  defaultValue={venue.capacity ?? ""}
                />
              </Field>
            </div>
            <Field label="Alamat" htmlFor="edit-venue-address">
              <Input id="edit-venue-address" name="address" required defaultValue={venue.address} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" variant="navy">Simpan perubahan</Button>
            </div>
          </form>
        </Card>

        <aside className="h-fit space-y-4">
          <Card className="p-5">
            <CardHeader title="Ringkasan" />
            <div className="mt-2 space-y-2">
              <SummaryRow label="ID venue">{venue.id}</SummaryRow>
              <SummaryRow label="Kapasitas">
                {venue.capacity?.toLocaleString("id-ID") ?? "—"}
              </SummaryRow>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Zona berbahaya" />
            <p className="mt-2 text-xs text-muted">
              Venue yang sudah dipakai event aktif tidak bisa dihapus.
            </p>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus venue
            </Button>
          </Card>
        </aside>
      </div>
    </main>
  );
}
